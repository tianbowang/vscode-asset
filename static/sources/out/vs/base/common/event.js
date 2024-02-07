/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/stopwatch"], function (require, exports, errors_1, functional_1, lifecycle_1, linkedList_1, stopwatch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Relay = exports.EventBufferer = exports.DynamicListEventMultiplexer = exports.EventMultiplexer = exports.MicrotaskEmitter = exports.DebounceEmitter = exports.PauseableEmitter = exports.AsyncEmitter = exports.createEventDeliveryQueue = exports.Emitter = exports.setGlobalLeakWarningThreshold = exports.EventProfiling = exports.Event = void 0;
    // -----------------------------------------------------------------------------------------------------------------------
    // Uncomment the next line to print warnings whenever an emitter with listeners is disposed. That is a sign of code smell.
    // -----------------------------------------------------------------------------------------------------------------------
    const _enableDisposeWithListenerWarning = false;
    // _enableDisposeWithListenerWarning = Boolean("TRUE"); // causes a linter warning so that it cannot be pushed
    // -----------------------------------------------------------------------------------------------------------------------
    // Uncomment the next line to print warnings whenever a snapshotted event is used repeatedly without cleanup.
    // See https://github.com/microsoft/vscode/issues/142851
    // -----------------------------------------------------------------------------------------------------------------------
    const _enableSnapshotPotentialLeakWarning = false;
    var Event;
    (function (Event) {
        Event.None = () => lifecycle_1.Disposable.None;
        function _addLeakageTraceLogic(options) {
            if (_enableSnapshotPotentialLeakWarning) {
                const { onDidAddListener: origListenerDidAdd } = options;
                const stack = Stacktrace.create();
                let count = 0;
                options.onDidAddListener = () => {
                    if (++count === 2) {
                        console.warn('snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here');
                        stack.print();
                    }
                    origListenerDidAdd?.();
                };
            }
        }
        /**
         * Given an event, returns another event which debounces calls and defers the listeners to a later task via a shared
         * `setTimeout`. The event is converted into a signal (`Event<void>`) to avoid additional object creation as a
         * result of merging events and to try prevent race conditions that could arise when using related deferred and
         * non-deferred events.
         *
         * This is useful for deferring non-critical work (eg. general UI updates) to ensure it does not block critical work
         * (eg. latency of keypress to text rendered).
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function defer(event, disposable) {
            return debounce(event, () => void 0, 0, undefined, true, undefined, disposable);
        }
        Event.defer = defer;
        /**
         * Given an event, returns another event which only fires once.
         *
         * @param event The event source for the new event.
         */
        function once(event) {
            return (listener, thisArgs = null, disposables) => {
                // we need this, in case the event fires during the listener call
                let didFire = false;
                let result = undefined;
                result = event(e => {
                    if (didFire) {
                        return;
                    }
                    else if (result) {
                        result.dispose();
                    }
                    else {
                        didFire = true;
                    }
                    return listener.call(thisArgs, e);
                }, null, disposables);
                if (didFire) {
                    result.dispose();
                }
                return result;
            };
        }
        Event.once = once;
        /**
         * Maps an event of one type into an event of another type using a mapping function, similar to how
         * `Array.prototype.map` works.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param map The mapping function.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function map(event, map, disposable) {
            return snapshot((listener, thisArgs = null, disposables) => event(i => listener.call(thisArgs, map(i)), null, disposables), disposable);
        }
        Event.map = map;
        /**
         * Wraps an event in another event that performs some function on the event object before firing.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param each The function to perform on the event object.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function forEach(event, each, disposable) {
            return snapshot((listener, thisArgs = null, disposables) => event(i => { each(i); listener.call(thisArgs, i); }, null, disposables), disposable);
        }
        Event.forEach = forEach;
        function filter(event, filter, disposable) {
            return snapshot((listener, thisArgs = null, disposables) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables), disposable);
        }
        Event.filter = filter;
        /**
         * Given an event, returns the same event but typed as `Event<void>`.
         */
        function signal(event) {
            return event;
        }
        Event.signal = signal;
        function any(...events) {
            return (listener, thisArgs = null, disposables) => {
                const disposable = (0, lifecycle_1.combinedDisposable)(...events.map(event => event(e => listener.call(thisArgs, e))));
                return addAndReturnDisposable(disposable, disposables);
            };
        }
        Event.any = any;
        /**
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         */
        function reduce(event, merge, initial, disposable) {
            let output = initial;
            return map(event, e => {
                output = merge(output, e);
                return output;
            }, disposable);
        }
        Event.reduce = reduce;
        function snapshot(event, disposable) {
            let listener;
            const options = {
                onWillAddFirstListener() {
                    listener = event(emitter.fire, emitter);
                },
                onDidRemoveLastListener() {
                    listener?.dispose();
                }
            };
            if (!disposable) {
                _addLeakageTraceLogic(options);
            }
            const emitter = new Emitter(options);
            disposable?.add(emitter);
            return emitter.event;
        }
        /**
         * Adds the IDisposable to the store if it's set, and returns it. Useful to
         * Event function implementation.
         */
        function addAndReturnDisposable(d, store) {
            if (store instanceof Array) {
                store.push(d);
            }
            else if (store) {
                store.add(d);
            }
            return d;
        }
        function debounce(event, merge, delay = 100, leading = false, flushOnListenerRemove = false, leakWarningThreshold, disposable) {
            let subscription;
            let output = undefined;
            let handle = undefined;
            let numDebouncedCalls = 0;
            let doFire;
            const options = {
                leakWarningThreshold,
                onWillAddFirstListener() {
                    subscription = event(cur => {
                        numDebouncedCalls++;
                        output = merge(output, cur);
                        if (leading && !handle) {
                            emitter.fire(output);
                            output = undefined;
                        }
                        doFire = () => {
                            const _output = output;
                            output = undefined;
                            handle = undefined;
                            if (!leading || numDebouncedCalls > 1) {
                                emitter.fire(_output);
                            }
                            numDebouncedCalls = 0;
                        };
                        if (typeof delay === 'number') {
                            clearTimeout(handle);
                            handle = setTimeout(doFire, delay);
                        }
                        else {
                            if (handle === undefined) {
                                handle = 0;
                                queueMicrotask(doFire);
                            }
                        }
                    });
                },
                onWillRemoveListener() {
                    if (flushOnListenerRemove && numDebouncedCalls > 0) {
                        doFire?.();
                    }
                },
                onDidRemoveLastListener() {
                    doFire = undefined;
                    subscription.dispose();
                }
            };
            if (!disposable) {
                _addLeakageTraceLogic(options);
            }
            const emitter = new Emitter(options);
            disposable?.add(emitter);
            return emitter.event;
        }
        Event.debounce = debounce;
        /**
         * Debounces an event, firing after some delay (default=0) with an array of all event original objects.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         */
        function accumulate(event, delay = 0, disposable) {
            return Event.debounce(event, (last, e) => {
                if (!last) {
                    return [e];
                }
                last.push(e);
                return last;
            }, delay, undefined, true, undefined, disposable);
        }
        Event.accumulate = accumulate;
        /**
         * Filters an event such that some condition is _not_ met more than once in a row, effectively ensuring duplicate
         * event objects from different sources do not fire the same event object.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param equals The equality condition.
         * @param disposable A disposable store to add the new EventEmitter to.
         *
         * @example
         * ```
         * // Fire only one time when a single window is opened or focused
         * Event.latch(Event.any(onDidOpenWindow, onDidFocusWindow))
         * ```
         */
        function latch(event, equals = (a, b) => a === b, disposable) {
            let firstCall = true;
            let cache;
            return filter(event, value => {
                const shouldEmit = firstCall || !equals(value, cache);
                firstCall = false;
                cache = value;
                return shouldEmit;
            }, disposable);
        }
        Event.latch = latch;
        /**
         * Splits an event whose parameter is a union type into 2 separate events for each type in the union.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @example
         * ```
         * const event = new EventEmitter<number | undefined>().event;
         * const [numberEvent, undefinedEvent] = Event.split(event, isUndefined);
         * ```
         *
         * @param event The event source for the new event.
         * @param isT A function that determines what event is of the first type.
         * @param disposable A disposable store to add the new EventEmitter to.
         */
        function split(event, isT, disposable) {
            return [
                Event.filter(event, isT, disposable),
                Event.filter(event, e => !isT(e), disposable),
            ];
        }
        Event.split = split;
        /**
         * Buffers an event until it has a listener attached.
         *
         * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
         * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
         * returned event causes this utility to leak a listener on the original event.
         *
         * @param event The event source for the new event.
         * @param flushAfterTimeout Determines whether to flush the buffer after a timeout immediately or after a
         * `setTimeout` when the first event listener is added.
         * @param _buffer Internal: A source event array used for tests.
         *
         * @example
         * ```
         * // Start accumulating events, when the first listener is attached, flush
         * // the event after a timeout such that multiple listeners attached before
         * // the timeout would receive the event
         * this.onInstallExtension = Event.buffer(service.onInstallExtension, true);
         * ```
         */
        function buffer(event, flushAfterTimeout = false, _buffer = [], disposable) {
            let buffer = _buffer.slice();
            let listener = event(e => {
                if (buffer) {
                    buffer.push(e);
                }
                else {
                    emitter.fire(e);
                }
            });
            if (disposable) {
                disposable.add(listener);
            }
            const flush = () => {
                buffer?.forEach(e => emitter.fire(e));
                buffer = null;
            };
            const emitter = new Emitter({
                onWillAddFirstListener() {
                    if (!listener) {
                        listener = event(e => emitter.fire(e));
                        if (disposable) {
                            disposable.add(listener);
                        }
                    }
                },
                onDidAddFirstListener() {
                    if (buffer) {
                        if (flushAfterTimeout) {
                            setTimeout(flush);
                        }
                        else {
                            flush();
                        }
                    }
                },
                onDidRemoveLastListener() {
                    if (listener) {
                        listener.dispose();
                    }
                    listener = null;
                }
            });
            if (disposable) {
                disposable.add(emitter);
            }
            return emitter.event;
        }
        Event.buffer = buffer;
        /**
         * Wraps the event in an {@link IChainableEvent}, allowing a more functional programming style.
         *
         * @example
         * ```
         * // Normal
         * const onEnterPressNormal = Event.filter(
         *   Event.map(onKeyPress.event, e => new StandardKeyboardEvent(e)),
         *   e.keyCode === KeyCode.Enter
         * ).event;
         *
         * // Using chain
         * const onEnterPressChain = Event.chain(onKeyPress.event, $ => $
         *   .map(e => new StandardKeyboardEvent(e))
         *   .filter(e => e.keyCode === KeyCode.Enter)
         * );
         * ```
         */
        function chain(event, sythensize) {
            const fn = (listener, thisArgs, disposables) => {
                const cs = sythensize(new ChainableSynthesis());
                return event(function (value) {
                    const result = cs.evaluate(value);
                    if (result !== HaltChainable) {
                        listener.call(thisArgs, result);
                    }
                }, undefined, disposables);
            };
            return fn;
        }
        Event.chain = chain;
        const HaltChainable = Symbol('HaltChainable');
        class ChainableSynthesis {
            constructor() {
                this.steps = [];
            }
            map(fn) {
                this.steps.push(fn);
                return this;
            }
            forEach(fn) {
                this.steps.push(v => {
                    fn(v);
                    return v;
                });
                return this;
            }
            filter(fn) {
                this.steps.push(v => fn(v) ? v : HaltChainable);
                return this;
            }
            reduce(merge, initial) {
                let last = initial;
                this.steps.push(v => {
                    last = merge(last, v);
                    return last;
                });
                return this;
            }
            latch(equals = (a, b) => a === b) {
                let firstCall = true;
                let cache;
                this.steps.push(value => {
                    const shouldEmit = firstCall || !equals(value, cache);
                    firstCall = false;
                    cache = value;
                    return shouldEmit ? value : HaltChainable;
                });
                return this;
            }
            evaluate(value) {
                for (const step of this.steps) {
                    value = step(value);
                    if (value === HaltChainable) {
                        break;
                    }
                }
                return value;
            }
        }
        /**
         * Creates an {@link Event} from a node event emitter.
         */
        function fromNodeEventEmitter(emitter, eventName, map = id => id) {
            const fn = (...args) => result.fire(map(...args));
            const onFirstListenerAdd = () => emitter.on(eventName, fn);
            const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
            const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
            return result.event;
        }
        Event.fromNodeEventEmitter = fromNodeEventEmitter;
        /**
         * Creates an {@link Event} from a DOM event emitter.
         */
        function fromDOMEventEmitter(emitter, eventName, map = id => id) {
            const fn = (...args) => result.fire(map(...args));
            const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
            const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
            const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
            return result.event;
        }
        Event.fromDOMEventEmitter = fromDOMEventEmitter;
        /**
         * Creates a promise out of an event, using the {@link Event.once} helper.
         */
        function toPromise(event) {
            return new Promise(resolve => once(event)(resolve));
        }
        Event.toPromise = toPromise;
        /**
         * Creates an event out of a promise that fires once when the promise is
         * resolved with the result of the promise or `undefined`.
         */
        function fromPromise(promise) {
            const result = new Emitter();
            promise.then(res => {
                result.fire(res);
            }, () => {
                result.fire(undefined);
            }).finally(() => {
                result.dispose();
            });
            return result.event;
        }
        Event.fromPromise = fromPromise;
        function runAndSubscribe(event, handler, initial) {
            handler(initial);
            return event(e => handler(e));
        }
        Event.runAndSubscribe = runAndSubscribe;
        class EmitterObserver {
            constructor(_observable, store) {
                this._observable = _observable;
                this._counter = 0;
                this._hasChanged = false;
                const options = {
                    onWillAddFirstListener: () => {
                        _observable.addObserver(this);
                    },
                    onDidRemoveLastListener: () => {
                        _observable.removeObserver(this);
                    }
                };
                if (!store) {
                    _addLeakageTraceLogic(options);
                }
                this.emitter = new Emitter(options);
                if (store) {
                    store.add(this.emitter);
                }
            }
            beginUpdate(_observable) {
                // assert(_observable === this.obs);
                this._counter++;
            }
            handlePossibleChange(_observable) {
                // assert(_observable === this.obs);
            }
            handleChange(_observable, _change) {
                // assert(_observable === this.obs);
                this._hasChanged = true;
            }
            endUpdate(_observable) {
                // assert(_observable === this.obs);
                this._counter--;
                if (this._counter === 0) {
                    this._observable.reportChanges();
                    if (this._hasChanged) {
                        this._hasChanged = false;
                        this.emitter.fire(this._observable.get());
                    }
                }
            }
        }
        /**
         * Creates an event emitter that is fired when the observable changes.
         * Each listeners subscribes to the emitter.
         */
        function fromObservable(obs, store) {
            const observer = new EmitterObserver(obs, store);
            return observer.emitter.event;
        }
        Event.fromObservable = fromObservable;
        /**
         * Each listener is attached to the observable directly.
         */
        function fromObservableLight(observable) {
            return (listener, thisArgs, disposables) => {
                let count = 0;
                let didChange = false;
                const observer = {
                    beginUpdate() {
                        count++;
                    },
                    endUpdate() {
                        count--;
                        if (count === 0) {
                            observable.reportChanges();
                            if (didChange) {
                                didChange = false;
                                listener.call(thisArgs);
                            }
                        }
                    },
                    handlePossibleChange() {
                        // noop
                    },
                    handleChange() {
                        didChange = true;
                    }
                };
                observable.addObserver(observer);
                observable.reportChanges();
                const disposable = {
                    dispose() {
                        observable.removeObserver(observer);
                    }
                };
                if (disposables instanceof lifecycle_1.DisposableStore) {
                    disposables.add(disposable);
                }
                else if (Array.isArray(disposables)) {
                    disposables.push(disposable);
                }
                return disposable;
            };
        }
        Event.fromObservableLight = fromObservableLight;
    })(Event || (exports.Event = Event = {}));
    class EventProfiling {
        static { this.all = new Set(); }
        static { this._idPool = 0; }
        constructor(name) {
            this.listenerCount = 0;
            this.invocationCount = 0;
            this.elapsedOverall = 0;
            this.durations = [];
            this.name = `${name}_${EventProfiling._idPool++}`;
            EventProfiling.all.add(this);
        }
        start(listenerCount) {
            this._stopWatch = new stopwatch_1.StopWatch();
            this.listenerCount = listenerCount;
        }
        stop() {
            if (this._stopWatch) {
                const elapsed = this._stopWatch.elapsed();
                this.durations.push(elapsed);
                this.elapsedOverall += elapsed;
                this.invocationCount += 1;
                this._stopWatch = undefined;
            }
        }
    }
    exports.EventProfiling = EventProfiling;
    let _globalLeakWarningThreshold = -1;
    function setGlobalLeakWarningThreshold(n) {
        const oldValue = _globalLeakWarningThreshold;
        _globalLeakWarningThreshold = n;
        return {
            dispose() {
                _globalLeakWarningThreshold = oldValue;
            }
        };
    }
    exports.setGlobalLeakWarningThreshold = setGlobalLeakWarningThreshold;
    class LeakageMonitor {
        constructor(threshold, name = Math.random().toString(18).slice(2, 5)) {
            this.threshold = threshold;
            this.name = name;
            this._warnCountdown = 0;
        }
        dispose() {
            this._stacks?.clear();
        }
        check(stack, listenerCount) {
            const threshold = this.threshold;
            if (threshold <= 0 || listenerCount < threshold) {
                return undefined;
            }
            if (!this._stacks) {
                this._stacks = new Map();
            }
            const count = (this._stacks.get(stack.value) || 0);
            this._stacks.set(stack.value, count + 1);
            this._warnCountdown -= 1;
            if (this._warnCountdown <= 0) {
                // only warn on first exceed and then every time the limit
                // is exceeded by 50% again
                this._warnCountdown = threshold * 0.5;
                // find most frequent listener and print warning
                let topStack;
                let topCount = 0;
                for (const [stack, count] of this._stacks) {
                    if (!topStack || topCount < count) {
                        topStack = stack;
                        topCount = count;
                    }
                }
                console.warn(`[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`);
                console.warn(topStack);
            }
            return () => {
                const count = (this._stacks.get(stack.value) || 0);
                this._stacks.set(stack.value, count - 1);
            };
        }
    }
    class Stacktrace {
        static create() {
            return new Stacktrace(new Error().stack ?? '');
        }
        constructor(value) {
            this.value = value;
        }
        print() {
            console.warn(this.value.split('\n').slice(2).join('\n'));
        }
    }
    let id = 0;
    class UniqueContainer {
        constructor(value) {
            this.value = value;
            this.id = id++;
        }
    }
    const compactionThreshold = 2;
    const forEachListener = (listeners, fn) => {
        if (listeners instanceof UniqueContainer) {
            fn(listeners);
        }
        else {
            for (let i = 0; i < listeners.length; i++) {
                const l = listeners[i];
                if (l) {
                    fn(l);
                }
            }
        }
    };
    /**
     * The Emitter can be used to expose an Event to the public
     * to fire it from the insides.
     * Sample:
        class Document {
    
            private readonly _onDidChange = new Emitter<(value:string)=>any>();
    
            public onDidChange = this._onDidChange.event;
    
            // getter-style
            // get onDidChange(): Event<(value:string)=>any> {
            // 	return this._onDidChange.event;
            // }
    
            private _doIt() {
                //...
                this._onDidChange.fire(value);
            }
        }
     */
    class Emitter {
        constructor(options) {
            this._size = 0;
            this._options = options;
            this._leakageMon = _globalLeakWarningThreshold > 0 || this._options?.leakWarningThreshold ? new LeakageMonitor(this._options?.leakWarningThreshold ?? _globalLeakWarningThreshold) : undefined;
            this._perfMon = this._options?._profName ? new EventProfiling(this._options._profName) : undefined;
            this._deliveryQueue = this._options?.deliveryQueue;
        }
        dispose() {
            if (!this._disposed) {
                this._disposed = true;
                // It is bad to have listeners at the time of disposing an emitter, it is worst to have listeners keep the emitter
                // alive via the reference that's embedded in their disposables. Therefore we loop over all remaining listeners and
                // unset their subscriptions/disposables. Looping and blaming remaining listeners is done on next tick because the
                // the following programming pattern is very popular:
                //
                // const someModel = this._disposables.add(new ModelObject()); // (1) create and register model
                // this._disposables.add(someModel.onDidChange(() => { ... }); // (2) subscribe and register model-event listener
                // ...later...
                // this._disposables.dispose(); disposes (1) then (2): don't warn after (1) but after the "overall dispose" is done
                if (this._deliveryQueue?.current === this) {
                    this._deliveryQueue.reset();
                }
                if (this._listeners) {
                    if (_enableDisposeWithListenerWarning) {
                        const listeners = this._listeners;
                        queueMicrotask(() => {
                            forEachListener(listeners, l => l.stack?.print());
                        });
                    }
                    this._listeners = undefined;
                    this._size = 0;
                }
                this._options?.onDidRemoveLastListener?.();
                this._leakageMon?.dispose();
            }
        }
        /**
         * For the public to allow to subscribe
         * to events from this Emitter
         */
        get event() {
            this._event ??= (callback, thisArgs, disposables) => {
                if (this._leakageMon && this._size > this._leakageMon.threshold * 3) {
                    console.warn(`[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far`);
                    return lifecycle_1.Disposable.None;
                }
                if (this._disposed) {
                    // todo: should we warn if a listener is added to a disposed emitter? This happens often
                    return lifecycle_1.Disposable.None;
                }
                if (thisArgs) {
                    callback = callback.bind(thisArgs);
                }
                const contained = new UniqueContainer(callback);
                let removeMonitor;
                let stack;
                if (this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2)) {
                    // check and record this emitter for potential leakage
                    contained.stack = Stacktrace.create();
                    removeMonitor = this._leakageMon.check(contained.stack, this._size + 1);
                }
                if (_enableDisposeWithListenerWarning) {
                    contained.stack = stack ?? Stacktrace.create();
                }
                if (!this._listeners) {
                    this._options?.onWillAddFirstListener?.(this);
                    this._listeners = contained;
                    this._options?.onDidAddFirstListener?.(this);
                }
                else if (this._listeners instanceof UniqueContainer) {
                    this._deliveryQueue ??= new EventDeliveryQueuePrivate();
                    this._listeners = [this._listeners, contained];
                }
                else {
                    this._listeners.push(contained);
                }
                this._size++;
                const result = (0, lifecycle_1.toDisposable)(() => { removeMonitor?.(); this._removeListener(contained); });
                if (disposables instanceof lifecycle_1.DisposableStore) {
                    disposables.add(result);
                }
                else if (Array.isArray(disposables)) {
                    disposables.push(result);
                }
                return result;
            };
            return this._event;
        }
        _removeListener(listener) {
            this._options?.onWillRemoveListener?.(this);
            if (!this._listeners) {
                return; // expected if a listener gets disposed
            }
            if (this._size === 1) {
                this._listeners = undefined;
                this._options?.onDidRemoveLastListener?.(this);
                this._size = 0;
                return;
            }
            // size > 1 which requires that listeners be a list:
            const listeners = this._listeners;
            const index = listeners.indexOf(listener);
            if (index === -1) {
                console.log('disposed?', this._disposed);
                console.log('size?', this._size);
                console.log('arr?', JSON.stringify(this._listeners));
                throw new Error('Attempted to dispose unknown listener');
            }
            this._size--;
            listeners[index] = undefined;
            const adjustDeliveryQueue = this._deliveryQueue.current === this;
            if (this._size * compactionThreshold <= listeners.length) {
                let n = 0;
                for (let i = 0; i < listeners.length; i++) {
                    if (listeners[i]) {
                        listeners[n++] = listeners[i];
                    }
                    else if (adjustDeliveryQueue) {
                        this._deliveryQueue.end--;
                        if (n < this._deliveryQueue.i) {
                            this._deliveryQueue.i--;
                        }
                    }
                }
                listeners.length = n;
            }
        }
        _deliver(listener, value) {
            if (!listener) {
                return;
            }
            const errorHandler = this._options?.onListenerError || errors_1.onUnexpectedError;
            if (!errorHandler) {
                listener.value(value);
                return;
            }
            try {
                listener.value(value);
            }
            catch (e) {
                errorHandler(e);
            }
        }
        /** Delivers items in the queue. Assumes the queue is ready to go. */
        _deliverQueue(dq) {
            const listeners = dq.current._listeners;
            while (dq.i < dq.end) {
                // important: dq.i is incremented before calling deliver() because it might reenter deliverQueue()
                this._deliver(listeners[dq.i++], dq.value);
            }
            dq.reset();
        }
        /**
         * To be kept private to fire an event to
         * subscribers
         */
        fire(event) {
            if (this._deliveryQueue?.current) {
                this._deliverQueue(this._deliveryQueue);
                this._perfMon?.stop(); // last fire() will have starting perfmon, stop it before starting the next dispatch
            }
            this._perfMon?.start(this._size);
            if (!this._listeners) {
                // no-op
            }
            else if (this._listeners instanceof UniqueContainer) {
                this._deliver(this._listeners, event);
            }
            else {
                const dq = this._deliveryQueue;
                dq.enqueue(this, event, this._listeners.length);
                this._deliverQueue(dq);
            }
            this._perfMon?.stop();
        }
        hasListeners() {
            return this._size > 0;
        }
    }
    exports.Emitter = Emitter;
    const createEventDeliveryQueue = () => new EventDeliveryQueuePrivate();
    exports.createEventDeliveryQueue = createEventDeliveryQueue;
    class EventDeliveryQueuePrivate {
        constructor() {
            /**
             * Index in current's listener list.
             */
            this.i = -1;
            /**
             * The last index in the listener's list to deliver.
             */
            this.end = 0;
        }
        enqueue(emitter, value, end) {
            this.i = 0;
            this.end = end;
            this.current = emitter;
            this.value = value;
        }
        reset() {
            this.i = this.end; // force any current emission loop to stop, mainly for during dispose
            this.current = undefined;
            this.value = undefined;
        }
    }
    class AsyncEmitter extends Emitter {
        async fireAsync(data, token, promiseJoin) {
            if (!this._listeners) {
                return;
            }
            if (!this._asyncDeliveryQueue) {
                this._asyncDeliveryQueue = new linkedList_1.LinkedList();
            }
            forEachListener(this._listeners, listener => this._asyncDeliveryQueue.push([listener.value, data]));
            while (this._asyncDeliveryQueue.size > 0 && !token.isCancellationRequested) {
                const [listener, data] = this._asyncDeliveryQueue.shift();
                const thenables = [];
                const event = {
                    ...data,
                    token,
                    waitUntil: (p) => {
                        if (Object.isFrozen(thenables)) {
                            throw new Error('waitUntil can NOT be called asynchronous');
                        }
                        if (promiseJoin) {
                            p = promiseJoin(p, listener);
                        }
                        thenables.push(p);
                    }
                };
                try {
                    listener(event);
                }
                catch (e) {
                    (0, errors_1.onUnexpectedError)(e);
                    continue;
                }
                // freeze thenables-collection to enforce sync-calls to
                // wait until and then wait for all thenables to resolve
                Object.freeze(thenables);
                await Promise.allSettled(thenables).then(values => {
                    for (const value of values) {
                        if (value.status === 'rejected') {
                            (0, errors_1.onUnexpectedError)(value.reason);
                        }
                    }
                });
            }
        }
    }
    exports.AsyncEmitter = AsyncEmitter;
    class PauseableEmitter extends Emitter {
        get isPaused() {
            return this._isPaused !== 0;
        }
        constructor(options) {
            super(options);
            this._isPaused = 0;
            this._eventQueue = new linkedList_1.LinkedList();
            this._mergeFn = options?.merge;
        }
        pause() {
            this._isPaused++;
        }
        resume() {
            if (this._isPaused !== 0 && --this._isPaused === 0) {
                if (this._mergeFn) {
                    // use the merge function to create a single composite
                    // event. make a copy in case firing pauses this emitter
                    if (this._eventQueue.size > 0) {
                        const events = Array.from(this._eventQueue);
                        this._eventQueue.clear();
                        super.fire(this._mergeFn(events));
                    }
                }
                else {
                    // no merging, fire each event individually and test
                    // that this emitter isn't paused halfway through
                    while (!this._isPaused && this._eventQueue.size !== 0) {
                        super.fire(this._eventQueue.shift());
                    }
                }
            }
        }
        fire(event) {
            if (this._size) {
                if (this._isPaused !== 0) {
                    this._eventQueue.push(event);
                }
                else {
                    super.fire(event);
                }
            }
        }
    }
    exports.PauseableEmitter = PauseableEmitter;
    class DebounceEmitter extends PauseableEmitter {
        constructor(options) {
            super(options);
            this._delay = options.delay ?? 100;
        }
        fire(event) {
            if (!this._handle) {
                this.pause();
                this._handle = setTimeout(() => {
                    this._handle = undefined;
                    this.resume();
                }, this._delay);
            }
            super.fire(event);
        }
    }
    exports.DebounceEmitter = DebounceEmitter;
    /**
     * An emitter which queue all events and then process them at the
     * end of the event loop.
     */
    class MicrotaskEmitter extends Emitter {
        constructor(options) {
            super(options);
            this._queuedEvents = [];
            this._mergeFn = options?.merge;
        }
        fire(event) {
            if (!this.hasListeners()) {
                return;
            }
            this._queuedEvents.push(event);
            if (this._queuedEvents.length === 1) {
                queueMicrotask(() => {
                    if (this._mergeFn) {
                        super.fire(this._mergeFn(this._queuedEvents));
                    }
                    else {
                        this._queuedEvents.forEach(e => super.fire(e));
                    }
                    this._queuedEvents = [];
                });
            }
        }
    }
    exports.MicrotaskEmitter = MicrotaskEmitter;
    /**
     * An event emitter that multiplexes many events into a single event.
     *
     * @example Listen to the `onData` event of all `Thing`s, dynamically adding and removing `Thing`s
     * to the multiplexer as needed.
     *
     * ```typescript
     * const anythingDataMultiplexer = new EventMultiplexer<{ data: string }>();
     *
     * const thingListeners = DisposableMap<Thing, IDisposable>();
     *
     * thingService.onDidAddThing(thing => {
     *   thingListeners.set(thing, anythingDataMultiplexer.add(thing.onData);
     * });
     * thingService.onDidRemoveThing(thing => {
     *   thingListeners.deleteAndDispose(thing);
     * });
     *
     * anythingDataMultiplexer.event(e => {
     *   console.log('Something fired data ' + e.data)
     * });
     * ```
     */
    class EventMultiplexer {
        constructor() {
            this.hasListeners = false;
            this.events = [];
            this.emitter = new Emitter({
                onWillAddFirstListener: () => this.onFirstListenerAdd(),
                onDidRemoveLastListener: () => this.onLastListenerRemove()
            });
        }
        get event() {
            return this.emitter.event;
        }
        add(event) {
            const e = { event: event, listener: null };
            this.events.push(e);
            if (this.hasListeners) {
                this.hook(e);
            }
            const dispose = () => {
                if (this.hasListeners) {
                    this.unhook(e);
                }
                const idx = this.events.indexOf(e);
                this.events.splice(idx, 1);
            };
            return (0, lifecycle_1.toDisposable)((0, functional_1.createSingleCallFunction)(dispose));
        }
        onFirstListenerAdd() {
            this.hasListeners = true;
            this.events.forEach(e => this.hook(e));
        }
        onLastListenerRemove() {
            this.hasListeners = false;
            this.events.forEach(e => this.unhook(e));
        }
        hook(e) {
            e.listener = e.event(r => this.emitter.fire(r));
        }
        unhook(e) {
            if (e.listener) {
                e.listener.dispose();
            }
            e.listener = null;
        }
        dispose() {
            this.emitter.dispose();
        }
    }
    exports.EventMultiplexer = EventMultiplexer;
    class DynamicListEventMultiplexer {
        constructor(items, onAddItem, onRemoveItem, getEvent) {
            this._store = new lifecycle_1.DisposableStore();
            const multiplexer = this._store.add(new EventMultiplexer());
            const itemListeners = this._store.add(new lifecycle_1.DisposableMap());
            function addItem(instance) {
                itemListeners.set(instance, multiplexer.add(getEvent(instance)));
            }
            // Existing items
            for (const instance of items) {
                addItem(instance);
            }
            // Added items
            this._store.add(onAddItem(instance => {
                addItem(instance);
            }));
            // Removed items
            this._store.add(onRemoveItem(instance => {
                itemListeners.deleteAndDispose(instance);
            }));
            this.event = multiplexer.event;
        }
        dispose() {
            this._store.dispose();
        }
    }
    exports.DynamicListEventMultiplexer = DynamicListEventMultiplexer;
    /**
     * The EventBufferer is useful in situations in which you want
     * to delay firing your events during some code.
     * You can wrap that code and be sure that the event will not
     * be fired during that wrap.
     *
     * ```
     * const emitter: Emitter;
     * const delayer = new EventDelayer();
     * const delayedEvent = delayer.wrapEvent(emitter.event);
     *
     * delayedEvent(console.log);
     *
     * delayer.bufferEvents(() => {
     *   emitter.fire(); // event will not be fired yet
     * });
     *
     * // event will only be fired at this point
     * ```
     */
    class EventBufferer {
        constructor() {
            this.buffers = [];
        }
        wrapEvent(event) {
            return (listener, thisArgs, disposables) => {
                return event(i => {
                    const buffer = this.buffers[this.buffers.length - 1];
                    if (buffer) {
                        buffer.push(() => listener.call(thisArgs, i));
                    }
                    else {
                        listener.call(thisArgs, i);
                    }
                }, undefined, disposables);
            };
        }
        bufferEvents(fn) {
            const buffer = [];
            this.buffers.push(buffer);
            const r = fn();
            this.buffers.pop();
            buffer.forEach(flush => flush());
            return r;
        }
    }
    exports.EventBufferer = EventBufferer;
    /**
     * A Relay is an event forwarder which functions as a replugabble event pipe.
     * Once created, you can connect an input event to it and it will simply forward
     * events from that input event through its own `event` property. The `input`
     * can be changed at any point in time.
     */
    class Relay {
        constructor() {
            this.listening = false;
            this.inputEvent = Event.None;
            this.inputEventListener = lifecycle_1.Disposable.None;
            this.emitter = new Emitter({
                onDidAddFirstListener: () => {
                    this.listening = true;
                    this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
                },
                onDidRemoveLastListener: () => {
                    this.listening = false;
                    this.inputEventListener.dispose();
                }
            });
            this.event = this.emitter.event;
        }
        set input(event) {
            this.inputEvent = event;
            if (this.listening) {
                this.inputEventListener.dispose();
                this.inputEventListener = event(this.emitter.fire, this.emitter);
            }
        }
        dispose() {
            this.inputEventListener.dispose();
            this.emitter.dispose();
        }
    }
    exports.Relay = Relay;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2V2ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRywwSEFBMEg7SUFDMUgsMEhBQTBIO0lBQzFILDBIQUEwSDtJQUMxSCxNQUFNLGlDQUFpQyxHQUFHLEtBQUssQ0FBQztJQUNoRCw4R0FBOEc7SUFHOUcsMEhBQTBIO0lBQzFILDZHQUE2RztJQUM3Ryx3REFBd0Q7SUFDeEQsMEhBQTBIO0lBQzFILE1BQU0sbUNBQW1DLEdBQUcsS0FBSyxDQUFDO0lBVWxELElBQWlCLEtBQUssQ0FzckJyQjtJQXRyQkQsV0FBaUIsS0FBSztRQUNSLFVBQUksR0FBZSxHQUFHLEVBQUUsQ0FBQyxzQkFBVSxDQUFDLElBQUksQ0FBQztRQUV0RCxTQUFTLHFCQUFxQixDQUFDLE9BQXVCO1lBQ3JELElBQUksbUNBQW1DLEVBQUUsQ0FBQztnQkFDekMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLEdBQUcsT0FBTyxDQUFDO2dCQUN6RCxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2xDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDZCxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxFQUFFO29CQUMvQixJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsRUFBRSxDQUFDO3dCQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLDRHQUE0RyxDQUFDLENBQUM7d0JBQzNILEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDZixDQUFDO29CQUNELGtCQUFrQixFQUFFLEVBQUUsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDO1lBQ0gsQ0FBQztRQUNGLENBQUM7UUFFRDs7Ozs7Ozs7Ozs7Ozs7O1dBZUc7UUFDSCxTQUFnQixLQUFLLENBQUMs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
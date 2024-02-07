(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/platform", "./symbols", "vs/base/common/lazy"], function (require, exports, cancellation_1, errors_1, event_1, lifecycle_1, resources_1, platform_1, symbols_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AsyncIterableSource = exports.createCancelableAsyncIterable = exports.CancelableAsyncIterableObject = exports.AsyncIterableObject = exports.LazyStatefulPromise = exports.StatefulPromise = exports.Promises = exports.DeferredPromise = exports.IntervalCounter = exports.TaskSequentializer = exports.retry = exports.GlobalIdleValue = exports.AbstractIdleValue = exports._runWhenIdle = exports.runWhenGlobalIdle = exports.ThrottledWorker = exports.RunOnceWorker = exports.ProcessTimeRunOnceScheduler = exports.RunOnceScheduler = exports.IntervalTimer = exports.TimeoutTimer = exports.ResourceQueue = exports.LimitedQueue = exports.Queue = exports.Limiter = exports.firstParallel = exports.first = exports.sequence = exports.disposableTimeout = exports.timeout = exports.AutoOpenBarrier = exports.Barrier = exports.ThrottledDelayer = exports.Delayer = exports.SequencerByKey = exports.Sequencer = exports.Throttler = exports.asPromise = exports.raceTimeout = exports.raceCancellablePromises = exports.raceCancellationError = exports.raceCancellation = exports.createCancelablePromise = exports.isThenable = void 0;
    function isThenable(obj) {
        return !!obj && typeof obj.then === 'function';
    }
    exports.isThenable = isThenable;
    function createCancelablePromise(callback) {
        const source = new cancellation_1.CancellationTokenSource();
        const thenable = callback(source.token);
        const promise = new Promise((resolve, reject) => {
            const subscription = source.token.onCancellationRequested(() => {
                subscription.dispose();
                reject(new errors_1.CancellationError());
            });
            Promise.resolve(thenable).then(value => {
                subscription.dispose();
                source.dispose();
                resolve(value);
            }, err => {
                subscription.dispose();
                source.dispose();
                reject(err);
            });
        });
        return new class {
            cancel() {
                source.cancel();
                source.dispose();
            }
            then(resolve, reject) {
                return promise.then(resolve, reject);
            }
            catch(reject) {
                return this.then(undefined, reject);
            }
            finally(onfinally) {
                return promise.finally(onfinally);
            }
        };
    }
    exports.createCancelablePromise = createCancelablePromise;
    function raceCancellation(promise, token, defaultValue) {
        return new Promise((resolve, reject) => {
            const ref = token.onCancellationRequested(() => {
                ref.dispose();
                resolve(defaultValue);
            });
            promise.then(resolve, reject).finally(() => ref.dispose());
        });
    }
    exports.raceCancellation = raceCancellation;
    /**
     * Returns a promise that rejects with an {@CancellationError} as soon as the passed token is cancelled.
     * @see {@link raceCancellation}
     */
    function raceCancellationError(promise, token) {
        return new Promise((resolve, reject) => {
            const ref = token.onCancellationRequested(() => {
                ref.dispose();
                reject(new errors_1.CancellationError());
            });
            promise.then(resolve, reject).finally(() => ref.dispose());
        });
    }
    exports.raceCancellationError = raceCancellationError;
    /**
     * Returns as soon as one of the promises resolves or rejects and cancels remaining promises
     */
    async function raceCancellablePromises(cancellablePromises) {
        let resolvedPromiseIndex = -1;
        const promises = cancellablePromises.map((promise, index) => promise.then(result => { resolvedPromiseIndex = index; return result; }));
        try {
            const result = await Promise.race(promises);
            return result;
        }
        finally {
            cancellablePromises.forEach((cancellablePromise, index) => {
                if (index !== resolvedPromiseIndex) {
                    cancellablePromise.cancel();
                }
            });
        }
    }
    exports.raceCancellablePromises = raceCancellablePromises;
    function raceTimeout(promise, timeout, onTimeout) {
        let promiseResolve = undefined;
        const timer = setTimeout(() => {
            promiseResolve?.(undefined);
            onTimeout?.();
        }, timeout);
        return Promise.race([
            promise.finally(() => clearTimeout(timer)),
            new Promise(resolve => promiseResolve = resolve)
        ]);
    }
    exports.raceTimeout = raceTimeout;
    function asPromise(callback) {
        return new Promise((resolve, reject) => {
            const item = callback();
            if (isThenable(item)) {
                item.then(resolve, reject);
            }
            else {
                resolve(item);
            }
        });
    }
    exports.asPromise = asPromise;
    /**
     * A helper to prevent accumulation of sequential async tasks.
     *
     * Imagine a mail man with the sole task of delivering letters. As soon as
     * a letter submitted for delivery, he drives to the destination, delivers it
     * and returns to his base. Imagine that during the trip, N more letters were submitted.
     * When the mail man returns, he picks those N letters and delivers them all in a
     * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
     *
     * The throttler implements this via the queue() method, by providing it a task
     * factory. Following the example:
     *
     * 		const throttler = new Throttler();
     * 		const letters = [];
     *
     * 		function deliver() {
     * 			const lettersToDeliver = letters;
     * 			letters = [];
     * 			return makeTheTrip(lettersToDeliver);
     * 		}
     *
     * 		function onLetterReceived(l) {
     * 			letters.push(l);
     * 			throttler.queue(deliver);
     * 		}
     */
    class Throttler {
        constructor() {
            this.isDisposed = false;
            this.activePromise = null;
            this.queuedPromise = null;
            this.queuedPromiseFactory = null;
        }
        queue(promiseFactory) {
            if (this.isDisposed) {
                return Promise.reject(new Error('Throttler is disposed'));
            }
            if (this.activePromise) {
                this.queuedPromiseFactory = promiseFactory;
                if (!this.queuedPromise) {
                    const onComplete = () => {
                        this.queuedPromise = null;
                        if (this.isDisposed) {
                            return;
                        }
                        const result = this.queue(this.queuedPromiseFactory);
                        this.queuedPromiseFactory = null;
                        return result;
                    };
                    this.queuedPromise = new Promise(resolve => {
                        this.activePromise.then(onComplete, onComplete).then(resolve);
                    });
                }
                return new Promise((resolve, reject) => {
                    this.queuedPromise.then(resolve, reject);
                });
            }
            this.activePromise = promiseFactory();
            return new Promise((resolve, reject) => {
                this.activePromise.then((result) => {
                    this.activePromise = null;
                    resolve(result);
                }, (err) => {
                    this.activePromise = null;
                    reject(err);
                });
            });
        }
        dispose() {
            this.isDisposed = true;
        }
    }
    exports.Throttler = Throttler;
    class Sequencer {
        constructor() {
            this.current = Promise.resolve(null);
        }
        queue(promiseTask) {
            return this.current = this.current.then(() => promiseTask(), () => promiseTask());
        }
    }
    exports.Sequencer = Sequencer;
    class SequencerByKey {
        constructor() {
            this.promiseMap = new Map();
        }
        queue(key, promiseTask) {
            const runningPromise = this.promiseMap.get(key) ?? Promise.resolve();
            const newPromise = runningPromise
                .catch(() => { })
                .then(promiseTask)
                .finally(() => {
                if (this.promiseMap.get(key) === newPromise) {
                    this.promiseMap.delete(key);
                }
            });
            this.promiseMap.set(key, newPromise);
            return newPromise;
        }
    }
    exports.SequencerByKey = SequencerByKey;
    const timeoutDeferred = (timeout, fn) => {
        let scheduled = true;
        const handle = setTimeout(() => {
            scheduled = false;
            fn();
        }, timeout);
        return {
            isTriggered: () => scheduled,
            dispose: () => {
                clearTimeout(handle);
                scheduled = false;
            },
        };
    };
    const microtaskDeferred = (fn) => {
        let scheduled = true;
        queueMicrotask(() => {
            if (scheduled) {
                scheduled = false;
                fn();
            }
        });
        return {
            isTriggered: () => scheduled,
            dispose: () => { scheduled = false; },
        };
    };
    /**
     * A helper to delay (debounce) execution of a task that is being requested often.
     *
     * Following the throttler, now imagine the mail man wants to optimize the number of
     * trips proactively. The trip itself can be long, so he decides not to make the trip
     * as soon as a letter is submitted. Instead he waits a while, in case more
     * letters are submitted. After said waiting period, if no letters were submitted, he
     * decides to make the trip. Imagine that N more letters were submitted after the first
     * one, all within a short period of time between each other. Even though N+1
     * submissions occurred, only 1 delivery was made.
     *
     * The delayer offers this behavior via the trigger() method, into which both the task
     * to be executed and the waiting period (delay) must be passed in as arguments. Following
     * the example:
     *
     * 		const delayer = new Delayer(WAITING_PERIOD);
     * 		const letters = [];
     *
     * 		function letterReceived(l) {
     * 			letters.push(l);
     * 			delayer.trigger(() => { return makeTheTrip(); });
     * 		}
     */
    class Delayer {
        constructor(defaultDelay) {
            this.defaultDelay = defaultDelay;
            this.deferred = null;
            this.completionPromise = null;
            this.doResolve = null;
            this.doReject = null;
            this.task = null;
        }
        trigger(task, delay = this.defaultDelay) {
            this.task = task;
            this.cancelTimeout();
            if (!this.completionPromise) {
                this.completionPromise = new Promise((resolve, reject) => {
                    this.doResolve = resolve;
                    this.doReject = reject;
                }).then(() => {
                    this.completionPromise = null;
                    this.doResolve = null;
                    if (this.task) {
                        const task = this.task;
                        this.task = null;
                        return task();
                    }
                    return undefined;
                });
            }
            const fn = () => {
                this.deferred = null;
                this.doResolve?.(null);
            };
            this.deferred = delay === symbols_1.MicrotaskDelay ? microtaskDeferred(fn) : timeoutDeferred(delay, fn);
            return this.completionPromise;
        }
        isTriggered() {
            return !!this.deferred?.isTriggered();
        }
        cancel() {
            this.cancelTimeout();
            if (this.completionPromise) {
                this.doReject?.(new errors_1.CancellationError());
                this.completionPromise = null;
            }
        }
        cancelTimeout() {
            this.deferred?.dispose();
            this.deferred = null;
        }
        dispose() {
            this.cancel();
        }
    }
    exports.Delayer = Delayer;
    /**
     * A helper to delay execution of a task that is being requested often, while
     * preventing accumulation of consecutive executions, while the task runs.
     *
     * The mail man is clever and waits for a certain amount of time, before going
     * out to deliver letters. While the mail man is going out, more letters arrive
     * and can only be delivered once he is back. Once he is back the mail man will
     * do one more trip to deliver the letters that have accumulated while he was out.
     */
    class ThrottledDelayer {
        constructor(defaultDelay) {
            this.delayer = new Delayer(defaultDelay);
            this.throttler = new Throttler();
        }
        trigger(promiseFactory, delay) {
            return this.delayer.trigger(() => this.throttler.queue(promiseFactory), delay);
        }
        isTriggered() {
            return this.delayer.isTriggered();
        }
        cancel() {
            this.delayer.cancel();
        }
        dispose() {
            this.delayer.dispose();
            this.throttler.dispose();
        }
    }
    exports.ThrottledDelayer = ThrottledDelayer;
    /**
     * A barrier that is initially closed and then becomes opened permanently.
     */
    class Barrier {
        constructor() {
            this._isOpen = false;
            this._promise = new Promise((c, e) => {
                this._completePromise = c;
            });
        }
        isOpen() {
            return this._isOpen;
        }
        open() {
            this._isOpen = true;
            this._completePromise(true);
        }
        wait() {
            return this._promise;
        }
    }
    exports.Barrier = Barrier;
    /**
     * A barrier that is initially closed and then becomes opened permanently after a certain period of
     * time or when open is called explicitly
     */
    class AutoOpenBarrier extends Barrier {
        constructor(autoOpenTimeMs) {
            super();
            this._timeout = setTimeout(() => this.open(), autoOpenTimeMs);
        }
        open() {
            clearTimeout(this._timeout);
            super.open();
        }
    }
    exports.AutoOpenBarrier = AutoOpenBarrier;
    function timeout(millis, token) {
        if (!token) {
            return createCancelablePromise(token => timeout(millis, token));
        }
        return new Promise((resolve, reject) => {
            const handle = setTimeout(() => {
                disposable.dispose();
                resolve();
            }, millis);
            const disposable = token.onCancellationRequested(() => {
                clearTimeout(handle);
                disposable.dispose();
                reject(new errors_1.CancellationError());
            });
        });
    }
    exports.timeout = timeout;
    /**
     * Creates a timeout that can be disposed using its returned value.
     * @param handler The timeout handler.
     * @param timeout An optional timeout in milliseconds.
     * @param store An optional {@link DisposableStore} that will have the timeout disposable managed automatically.
     *
     * @example
     * const store = new DisposableStore;
     * // Call the timeout after 1000ms at which point it will be automatically
     * // evicted from the store.
     * const timeoutDisposable = disposableTimeout(() => {}, 1000, store);
     *
     * if (foo) {
     *   // Cancel the timeout and evict it from store.
     *   timeoutDisposable.dispose();
     * }
     */
    function disposableTimeout(handler, timeout = 0, store) {
        const timer = setTimeout(() => {
            handler();
            if (store) {
                disposable.dispose();
            }
        }, timeout);
        const disposable = (0, lifecycle_1.toDisposable)(() => {
            clearTimeout(timer);
            store?.deleteAndLeak(disposable);
        });
        store?.add(disposable);
        return disposable;
    }
    exports.disposableTimeout = disposableTimeout;
    /**
     * Runs the provided list of promise factories in sequential order. The returned
     * promise will complete to an array of results from each promise.
     */
    function sequence(promiseFactories) {
        const results = [];
        let index = 0;
        const len = promiseFactories.length;
        function next() {
            return index < len ? promiseFactories[index++]() : null;
        }
        function thenHandler(result) {
            if (result !== undefined && result !== null) {
                results.push(result);
            }
            const n = next();
            if (n) {
                return n.then(thenHandler);
            }
            return Promise.resolve(results);
        }
        return Promise.resolve(null).then(thenHandler);
    }
    exports.sequence = sequence;
    function first(promiseFactories, shouldStop = t => !!t, defaultValue = null) {
        let index = 0;
        const len = promiseFactories.length;
        const loop = () => {
            if (index >= len) {
                return Promise.resolve(defaultValue);
            }
            const factory = promiseFactories[index++];
            const promise = Promise.resolve(factory());
            return promise.then(result => {
                if (shouldStop(result)) {
                    return Promise.resolve(result);
                }
                return loop();
            });
        };
        return loop();
    }
    exports.first = first;
    function firstParallel(promiseList, shouldStop = t => !!t, defaultValue = null) {
        if (promiseList.length === 0) {
            return Promise.resolve(defaultValue);
        }
        let todo = promiseList.length;
        const finish = () => {
            todo = -1;
            for (const promise of promiseList) {
                promise.cancel?.();
            }
        };
        return new Promise((resolve, reject) => {
            for (const promise of promiseList) {
                promise.then(result => {
                    if (--todo >= 0 && shouldStop(result)) {
                        finish();
                        resolve(result);
                    }
                    else if (todo === 0) {
                        resolve(defaultValue);
                    }
                })
                    .catch(err => {
                    if (--todo >= 0) {
                        finish();
                        reject(err);
                    }
                });
            }
        });
    }
    exports.firstParallel = firstParallel;
    /**
     * A helper to queue N promises and run them all with a max degree of parallelism. The helper
     * ensures that at any time no more than M promises are running at the same time.
     */
    class Limiter {
        constructor(maxDegreeOfParalellism) {
            this._size = 0;
            this._isDisposed = false;
            this.maxDegreeOfParalellism = maxDegreeOfParalellism;
            this.outstandingPromises = [];
            this.runningPromises = 0;
            this._onDrained = new event_1.Emitter();
        }
        /**
         *
         * @returns A promise that resolved when all work is done (onDrained) or when
         * there is nothing to do
         */
        whenIdle() {
            return this.size > 0
                ? event_1.Event.toPromise(this.onDrained)
                : Promise.resolve();
        }
        get onDrained() {
            return this._onDrained.event;
        }
        get size() {
            return this._size;
        }
        queue(factory) {
            if (this._isDisposed) {
                throw new Error('Object has been disposed');
            }
            this._size++;
            return new Promise((c, e) => {
                this.outstandingPromises.push({ factory, c, e });
                this.consume();
            });
        }
        consume() {
            while (this.outstandingPromises.length && this.runningPromises < this.maxDegreeOfParalellism) {
                const iLimitedTask = this.outstandingPromises.shift();
                this.runningPromises++;
                const promise = iLimitedTask.factory();
                promise.then(iLimitedTask.c, iLimitedTask.e);
                promise.then(() => this.consumed(), () => this.consumed());
            }
        }
        consumed() {
            if (this._isDisposed) {
                return;
            }
            this.runningPromises--;
            if (--this._size === 0) {
                this._onDrained.fire();
            }
            if (this.outstandingPromises.length > 0) {
                this.consume();
            }
        }
        clear() {
            if (this._isDisposed) {
                throw new Error('Object has been disposed');
            }
            this.outstandingPromises.length = 0;
            this._size = this.runningPromises;
        }
        dispose() {
            this._isDisposed = true;
            this.outstandingPromises.length = 0; // stop further processing
            this._size = 0;
            this._onDrained.dispose();
        }
    }
    exports.Limiter = Limiter;
    /**
     * A queue is handles one promise at a time and guarantees that at any time only one promise is executing.
     */
    class Queue extends Limiter {
        constructor() {
            super(1);
        }
    }
    exports.Queue = Queue;
    /**
     * Same as `Queue`, ensures that only 1 task is executed at the same time. The difference to `Queue` is that
     * there is only 1 task about to be scheduled next. As such, calling `queue` while a task is executing will
     * replace the currently queued task until it executes.
     *
     * As such, the returned promise may not be from the factory that is passed in but from the next factory that
     * is running after having called `queue`.
     */
    class LimitedQueue {
        constructor() {
            this.sequentializer = new TaskSequentializer();
            this.tasks = 0;
        }
        queue(factory) {
            if (!this.sequentializer.isRunning()) {
                return this.sequentializer.run(this.tasks++, factory());
            }
            return this.sequentializer.queue(() => {
                return this.sequentializer.run(this.tasks++, factory());
            });
        }
    }
    exports.LimitedQueue = LimitedQueue;
    /**
     * A helper to organize queues per resource. The ResourceQueue makes sure to manage queues per resource
     * by disposing them once the queue is empty.
     */
    class ResourceQueue {
        constructor() {
            this.queues = new Map();
            this.drainers = new Set();
            this.drainListeners = undefined;
            this.drainListenerCount = 0;
        }
        async whenDrained() {
            if (this.isDrained()) {
                return;
            }
            const promise = new DeferredPromise();
            this.drainers.add(promise);
            return promise.p;
        }
        isDrained() {
            for (const [, queue] of this.queues) {
                if (queue.size > 0) {
                    return false;
                }
            }
            return true;
        }
        queueSize(resource, extUri = resources_1.extUri) {
            const key = extUri.getComparisonKey(resource);
            return this.queues.get(key)?.size ?? 0;
        }
        queueFor(resource, factory, extUri = resources_1.extUri) {
            const key = extUri.getComparisonKey(resource);
            let queue = this.queues.get(key);
            if (!queue) {
                queue = new Queue();
                const drainListenerId = this.drainListenerCount++;
                const drainListener = event_1.Event.once(queue.onDrained)(() => {
                    queue?.dispose();
                    this.queues.delete(key);
                    this.onDidQueueDrain();
                    this.drainListeners?.deleteAndDispose(drainListenerId);
                    if (this.drainListeners?.size === 0) {
                        this.drainListeners.dispose();
                        this.drainListeners = undefined;
                    }
                });
                if (!this.drainListeners) {
                    this.drainListeners = new lifecycle_1.DisposableMap();
                }
                this.drainListeners.set(drainListenerId, drainListener);
                this.queues.set(key, queue);
            }
            return queue.queue(factory);
        }
        onDidQueueDrain() {
            if (!this.isDrained()) {
                return; // not done yet
            }
            this.releaseDrainers();
        }
        releaseDrainers() {
            for (const drainer of this.drainers) {
                drainer.complete();
            }
            this.drainers.clear();
        }
        dispose() {
            for (const [, queue] of this.queues) {
                queue.dispose();
            }
            this.queues.clear();
            // Even though we might still have pending
            // tasks queued, after the queues have been
            // disposed, we can no longer track them, so
            // we release drainers to prevent hanging
            // promises when the resource queue is being
            // disposed.
            this.releaseDrainers();
            this.drainListeners?.dispose();
        }
    }
    exports.ResourceQueue = ResourceQueue;
    class TimeoutTimer {
        constructor(runner, timeout) {
            this._token = -1;
            if (typeof runner === 'function' && typeof timeout === 'number') {
                this.setIfNotSet(runner, timeout);
            }
        }
        dispose() {
            this.cancel();
        }
        cancel() {
            if (this._token !== -1) {
                clearTimeout(this._token);
                this._token = -1;
            }
        }
        cancelAndSet(runner, timeout) {
            this.cancel();
            this._token = setTimeout(() => {
                this._token = -1;
                runner();
            }, timeout);
        }
        setIfNotSet(runner, timeout) {
            if (this._token !== -1) {
                // timer is already set
                return;
            }
            this._token = setTimeout(() => {
                this._token = -1;
                runner();
            }, timeout);
        }
    }
    exports.TimeoutTimer = TimeoutTimer;
    class IntervalTimer {
        constructor() {
            this.disposable = undefined;
        }
        cancel() {
            this.disposable?.dispose();
            this.disposable = undefined;
        }
        cancelAndSet(runner, interval, context = globalThis) {
            this.cancel();
            const handle = context.setInterval(() => {
                runner();
            }, interval);
            this.disposable = (0, lifecycle_1.toDisposable)(() => {
                context.clearInterval(handle);
                this.disposable = undefined;
            });
        }
        dispose() {
            this.cancel();
        }
    }
    exports.IntervalTimer = IntervalTimer;
    class RunOnceScheduler {
        constructor(runner, delay) {
            this.timeoutToken = -1;
            this.runner = runner;
            this.timeout = delay;
            this.timeoutHandler = this.onTimeout.bind(this);
        }
        /**
         * Dispose RunOnceScheduler
         */
        dispose() {
            this.cancel();
            this.runner = null;
        }
        /**
         * Cancel current scheduled runner (if any).
         */
        cancel() {
            if (this.isScheduled()) {
                clearTimeout(this.timeoutToken);
                this.timeoutToken = -1;
            }
        }
        /**
         * Cancel previous runner (if any) & schedule a new runner.
         */
        schedule(delay = this.timeout) {
            this.cancel();
            this.timeoutToken = setTimeout(this.timeoutHandler, delay);
        }
        get delay() {
            return this.timeout;
        }
        set delay(value) {
            this.timeout = value;
        }
        /**
         * Returns true if scheduled.
         */
        isScheduled() {
            return this.timeoutToken !== -1;
        }
        flush() {
            if (this.isScheduled()) {
                this.cancel();
                this.doRun();
            }
        }
        onTimeout() {
            this.timeoutToken = -1;
            if (this.runner) {
                this.doRun();
            }
        }
        doRun() {
            this.runner?.();
        }
    }
    exports.RunOnceScheduler = RunOnceScheduler;
    /**
     * Same as `RunOnceScheduler`, but doesn't count the time spent in sleep mode.
     * > **NOTE**: Only offers 1s resolution.
     *
     * When calling `setTimeout` with 3hrs, and putting the computer immediately to sleep
     * for 8hrs, `setTimeout` will fire **as soon as the computer wakes from sleep**. But
     * this scheduler will execute 3hrs **after waking the computer from sleep**.
     */
    class ProcessTimeRunOnceScheduler {
        constructor(runner, delay) {
            if (delay % 1000 !== 0) {
                console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
            }
            this.runner = runner;
            this.timeout = delay;
            this.counter = 0;
            this.intervalToken = -1;
            this.intervalHandler = this.onInterval.bind(this);
        }
        dispose() {
            this.cancel();
            this.runner = null;
        }
        cancel() {
            if (this.isScheduled()) {
                clearInterval(this.intervalToken);
                this.intervalToken = -1;
            }
        }
        /**
         * Cancel previous runner (if any) & schedule a new runner.
         */
        schedule(delay = this.timeout) {
            if (delay % 1000 !== 0) {
                console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
            }
            this.cancel();
            this.counter = Math.ceil(delay / 1000);
            this.intervalToken = setInterval(this.intervalHandler, 1000);
        }
        /**
         * Returns true if scheduled.
         */
        isScheduled() {
            return this.intervalToken !== -1;
        }
        onInterval() {
            this.counter--;
            if (this.counter > 0) {
                // still need to wait
                return;
            }
            // time elapsed
            clearInterval(this.intervalToken);
            this.intervalToken = -1;
            this.runner?.();
        }
    }
    exports.ProcessTimeRunOnceScheduler = ProcessTimeRunOnceScheduler;
    class RunOnceWorker extends RunOnceScheduler {
        constructor(runner, timeout) {
            super(runner, timeout);
            this.units = [];
        }
        work(unit) {
            this.units.push(unit);
            if (!this.isScheduled()) {
                this.schedule();
            }
        }
        doRun() {
            const units = this.units;
            this.units = [];
            this.runner?.(units);
        }
        dispose() {
            this.units = [];
            super.dispose();
        }
    }
    exports.RunOnceWorker = RunOnceWorker;
    /**
     * The `ThrottledWorker` will accept units of work `T`
     * to handle. The contract is:
     * * there is a maximum of units the worker can handle at once (via `maxWorkChunkSize`)
     * * there is a maximum of units the worker will keep in memory for processing (via `maxBufferedWork`)
     * * after having handled `maxWorkChunkSize` units, the worker needs to rest (via `throttleDelay`)
     */
    class ThrottledWorker extends lifecycle_1.Disposable {
        constructor(options, handler) {
            super();
            this.options = options;
            this.handler = handler;
            this.pendingWork = [];
            this.throttler = this._register(new lifecycle_1.MutableDisposable());
            this.disposed = false;
        }
        /**
         * The number of work units that are pending to be processed.
         */
        get pending() { return this.pendingWork.length; }
        /**
         * Add units to be worked on. Use `pending` to figure out
         * how many units are not yet processed after this method
         * was called.
         *
         * @returns whether the work was accepted or not. If the
         * worker is disposed, it will not accept any more work.
         * If the number of pending units would become larger
         * than `maxPendingWork`, more work will also not be accepted.
         */
        work(units) {
            if (this.disposed) {
                return false; // work not accepted: disposed
            }
            // Check for reaching maximum of pending work
            if (typeof this.options.maxBufferedWork === 'number') {
                // Throttled: simple check if pending + units exceeds max pending
                if (this.throttler.value) {
                    if (this.pending + units.length > this.options.maxBufferedWork) {
                        return false; // work not accepted: too much pending work
                    }
                }
                // Unthrottled: same as throttled, but account for max chunk getting
                // worked on directly without being pending
                else {
                    if (this.pending + units.length - this.options.maxWorkChunkSize > this.options.maxBufferedWork) {
                        return false; // work not accepted: too much pending work
                    }
                }
            }
            // Add to pending units first
            for (const unit of units) {
                this.pendingWork.push(unit);
            }
            // If not throttled, start working directly
            // Otherwise, when the throttle delay has
            // past, pending work will be worked again.
            if (!this.throttler.value) {
                this.doWork();
            }
            return true; // work accepted
        }
        doWork() {
            // Extract chunk to handle and handle it
            this.handler(this.pendingWork.splice(0, this.options.maxWorkChunkSize));
            // If we have remaining work, schedule it after a delay
            if (this.pendingWork.length > 0) {
                this.throttler.value = new RunOnceScheduler(() => {
                    this.throttler.clear();
                    this.doWork();
                }, this.options.throttleDelay);
                this.throttler.value.schedule();
            }
        }
        dispose() {
            super.dispose();
            this.disposed = true;
        }
    }
    exports.ThrottledWorker = ThrottledWorker;
    (function () {
        if (typeof globalThis.requestIdleCallback !== 'function' || typeof globalThis.cancelIdleCallback !== 'function') {
            exports._runWhenIdle = (_targetWindow, runner) => {
                (0, platform_1.setTimeout0)(() => {
                    if (disposed) {
                        return;
                    }
                    const end = Date.now() + 15; // one frame at 64fps
                    const deadline = {
                        didTimeout: true,
                        timeRemaining() {
                            return Math.max(0, end - Date.now());
                        }
                    };
                    runner(Object.freeze(deadline));
                });
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                    }
                };
            };
        }
        else {
            exports._runWhenIdle = (targetWindow, runner, timeout) => {
                const handle = targetWindow.requestIdleCallback(runner, typeof timeout === 'number' ? { timeout } : undefined);
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                        targetWindow.cancelIdleCallback(handle);
                    }
                };
            };
        }
        exports.runWhenGlobalIdle = (runner) => (0, exports._runWhenIdle)(globalThis, runner);
    })();
    class AbstractIdleValue {
        constructor(targetWindow, executor) {
            this._didRun = false;
            this._executor = () => {
                try {
                    this._value = executor();
                }
                catch (err) {
                    this._error = err;
                }
                finally {
                    this._didRun = true;
                }
            };
            this._handle = (0, exports._runWhenIdle)(targetWindow, () => this._executor());
        }
        dispose() {
            this._handle.dispose();
        }
        get value() {
            if (!this._didRun) {
                this._handle.dispose();
                this._executor();
            }
            if (this._error) {
                throw this._error;
            }
            return this._value;
        }
        get isInitialized() {
            return this._didRun;
        }
    }
    exports.AbstractIdleValue = AbstractIdleValue;
    /**
     * An `IdleValue` that always uses the current window (which might be throttled or inactive)
     *
     * **Note** that there is `dom.ts#WindowIdleValue` which is better suited when running inside a browser
     * context
     */
    class GlobalIdleValue extends AbstractIdleValue {
        constructor(executor) {
            super(globalThis, executor);
        }
    }
    exports.GlobalIdleValue = GlobalIdleValue;
    //#endregion
    async function retry(task, delay, retries) {
        let lastError;
        for (let i = 0; i < retries; i++) {
            try {
                return await task();
            }
            catch (error) {
                lastError = error;
                await timeout(delay);
            }
        }
        throw lastError;
    }
    exports.retry = retry;
    /**
     * @deprecated use `LimitedQueue` instead for an easier to use API
     */
    class TaskSequentializer {
        isRunning(taskId) {
            if (typeof taskId === 'number') {
                return this._running?.taskId === taskId;
            }
            return !!this._running;
        }
        get running() {
            return this._running?.promise;
        }
        cancelRunning() {
            this._running?.cancel();
        }
        run(taskId, promise, onCancel) {
            this._running = { taskId, cancel: () => onCancel?.(), promise };
            promise.then(() => this.doneRunning(taskId), () => this.doneRunning(taskId));
            return promise;
        }
        doneRunning(taskId) {
            if (this._running && taskId === this._running.taskId) {
                // only set running to done if the promise finished that is associated with that taskId
                this._running = undefined;
                // schedule the queued task now that we are free if we have any
                this.runQueued();
            }
        }
        runQueued() {
            if (this._queued) {
                const queued = this._queued;
                this._queued = undefined;
                // Run queued task and complete on the associated promise
                queued.run().then(queued.promiseResolve, queued.promiseReject);
            }
        }
        /**
         * Note: the promise to schedule as next run MUST itself call `run`.
         *       Otherwise, this sequentializer will report `false` for `isRunning`
         *       even when this task is running. Missing this detail means that
         *       suddenly multiple tasks will run in parallel.
         */
        queue(run) {
            // this is our first queued task, so we create associated promise with it
            // so that we can return a promise that completes when the task has
            // completed.
            if (!this._queued) {
                let promiseResolve;
                let promiseReject;
                const promise = new Promise((resolve, reject) => {
                    promiseResolve = resolve;
                    promiseReject = reject;
                });
                this._queued = {
                    run,
                    promise,
                    promiseResolve: promiseResolve,
                    promiseReject: promiseReject
                };
            }
            // we have a previous queued task, just overwrite it
            else {
                this._queued.run = run;
            }
            return this._queued.promise;
        }
        hasQueued() {
            return !!this._queued;
        }
        async join() {
            return this._queued?.promise ?? this._running?.promise;
        }
    }
    exports.TaskSequentializer = TaskSequentializer;
    //#endregion
    //#region
    /**
     * The `IntervalCounter` allows to count the number
     * of calls to `increment()` over a duration of
     * `interval`. This utility can be used to conditionally
     * throttle a frequent task when a certain threshold
     * is reached.
     */
    class IntervalCounter {
        constructor(interval, nowFn = () => Date.now()) {
            this.interval = interval;
            this.nowFn = nowFn;
            this.lastIncrementTime = 0;
            this.value = 0;
        }
        increment() {
            const now = this.nowFn();
            // We are outside of the range of `interval` and as such
            // start counting from 0 and remember the time
            if (now - this.lastIncrementTime > this.interval) {
                this.lastIncrementTime = now;
                this.value = 0;
            }
            this.value++;
            return this.value;
        }
    }
    exports.IntervalCounter = IntervalCounter;
    var DeferredOutcome;
    (function (DeferredOutcome) {
        DeferredOutcome[DeferredOutcome["Resolved"] = 0] = "Resolved";
        DeferredOutcome[DeferredOutcome["Rejected"] = 1] = "Rejected";
    })(DeferredOutcome || (DeferredOutcome = {}));
    /**
     * Creates a promise whose resolution or rejection can be controlled imperatively.
     */
    class DeferredPromise {
        get isRejected() {
            return this.outcome?.outcome === 1 /* DeferredOutcome.Rejected */;
        }
        get isResolved() {
            return this.outcome?.outcome === 0 /* DeferredOutcome.Resolved */;
        }
        get isSettled() {
            return !!this.outcome;
        }
        get value() {
            return this.outcome?.outcome === 0 /* DeferredOutcome.Resolved */ ? this.outcome?.value : undefined;
        }
        constructor() {
            this.p = new Promise((c, e) => {
                this.completeCallback = c;
                this.errorCallback = e;
            });
        }
        complete(value) {
            return new Promise(resolve => {
                this.completeCallback(value);
                this.outcome = { outcome: 0 /* DeferredOutcome.Resolved */, value };
                resolve();
            });
        }
        error(err) {
            return new Promise(resolve => {
                this.errorCallback(err);
                this.outcome = { outcome: 1 /* DeferredOutcome.Rejected */, value: err };
                resolve();
            });
        }
        cancel() {
            return this.error(new errors_1.CancellationError());
        }
    }
    exports.DeferredPromise = DeferredPromise;
    //#endregion
    //#region Promises
    var Promises;
    (function (Promises) {
        /**
         * A drop-in replacement for `Promise.all` with the only difference
         * that the method awaits every promise to either fulfill or reject.
         *
         * Similar to `Promise.all`, only the first error will be returned
         * if any.
         */
        async function settled(promises) {
            let firstError = undefined;
            const result = await Promise.all(promises.map(promise => promise.then(value => value, error => {
                if (!firstError) {
                    firstError = error;
                }
                return undefined; // do not rethrow so that other promises can settle
            })));
            if (typeof firstError !== 'undefined') {
                throw firstError;
            }
            return result; // cast is needed and protected by the `throw` above
        }
        Promises.settled = settled;
        /**
         * A helper to create a new `Promise<T>` with a body that is a promise
         * itself. By default, an error that raises from the async body will
         * end up as a unhandled rejection, so this utility properly awaits the
         * body and rejects the promise as a normal promise does without async
         * body.
         *
         * This method should only be used in rare cases where otherwise `async`
         * cannot be used (e.g. when callbacks are involved that require this).
         */
        function withAsyncBody(bodyFn) {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                try {
                    await bodyFn(resolve, reject);
                }
                catch (error) {
                    reject(error);
                }
            });
        }
        Promises.withAsyncBody = withAsyncBody;
    })(Promises || (exports.Promises = Promises = {}));
    class StatefulPromise {
        get value() { return this._value; }
        get error() { return this._error; }
        get isResolved() { return this._isResolved; }
        constructor(promise) {
            this._value = undefined;
            this._error = undefined;
            this._isResolved = false;
            this.promise = promise.then(value => {
                this._value = value;
                this._isResolved = true;
                return value;
            }, error => {
                this._error = error;
                this._isResolved = true;
                throw error;
            });
        }
        /**
         * Returns the resolved value.
         * Throws if the promise is not resolved yet.
         */
        requireValue() {
            if (!this._isResolved) {
                throw new errors_1.BugIndicatingError('Promise is not resolved yet');
            }
            if (this._error) {
                throw this._error;
            }
            return this._value;
        }
    }
    exports.StatefulPromise = StatefulPromise;
    class LazyStatefulPromise {
        constructor(_compute) {
            this._compute = _compute;
            this._promise = new lazy_1.Lazy(() => new StatefulPromise(this._compute()));
        }
        /**
         * Returns the resolved value.
         * Throws if the promise is not resolved yet.
         */
        requireValue() {
            return this._promise.value.requireValue();
        }
        /**
         * Returns the promise (and triggers a computation of the promise if not yet done so).
         */
        getPromise() {
            return this._promise.value.promise;
        }
        /**
         * Reads the current value without triggering a computation of the promise.
         */
        get currentValue() {
            return this._promise.rawValue?.value;
        }
    }
    exports.LazyStatefulPromise = LazyStatefulPromise;
    //#endregion
    //#region
    var AsyncIterableSourceState;
    (function (AsyncIterableSourceState) {
        AsyncIterableSourceState[AsyncIterableSourceState["Initial"] = 0] = "Initial";
        AsyncIterableSourceState[AsyncIterableSourceState["DoneOK"] = 1] = "DoneOK";
        AsyncIterableSourceState[AsyncIterableSourceState["DoneError"] = 2] = "DoneError";
    })(AsyncIterableSourceState || (AsyncIterableSourceState = {}));
    /**
     * A rich implementation for an `AsyncIterable<T>`.
     */
    class AsyncIterableObject {
        static fromArray(items) {
            return new AsyncIterableObject((writer) => {
                writer.emitMany(items);
            });
        }
        static fromPromise(promise) {
            return new AsyncIterableObject(async (emitter) => {
                emitter.emitMany(await promise);
            });
        }
        static fromPromises(promises) {
            return new AsyncIterableObject(async (emitter) => {
                await Promise.all(promises.map(async (p) => emitter.emitOne(await p)));
            });
        }
        static merge(iterables) {
            return new AsyncIterableObject(async (emitter) => {
                await Promise.all(iterables.map(async (iterable) => {
                    for await (const item of iterable) {
                        emitter.emitOne(item);
                    }
                }));
            });
        }
        static { this.EMPTY = AsyncIterableObject.fromArray([]); }
        constructor(executor) {
            this._state = 0 /* AsyncIterableSourceState.Initial */;
            this._results = [];
            this._error = null;
            this._onStateChanged = new event_1.Emitter();
            queueMicrotask(async () => {
                const writer = {
                    emitOne: (item) => this.emitOne(item),
                    emitMany: (items) => this.emitMany(items),
                    reject: (error) => this.reject(error)
                };
                try {
                    await Promise.resolve(executor(writer));
                    this.resolve();
                }
                catch (err) {
                    this.reject(err);
                }
                finally {
                    writer.emitOne = undefined;
                    writer.emitMany = undefined;
                    writer.reject = undefined;
                }
            });
        }
        [Symbol.asyncIterator]() {
            let i = 0;
            return {
                next: async () => {
                    do {
                        if (this._state === 2 /* AsyncIterableSourceState.DoneError */) {
                            throw this._error;
                        }
                        if (i < this._results.length) {
                            return { done: false, value: this._results[i++] };
                        }
                        if (this._state === 1 /* AsyncIterableSourceState.DoneOK */) {
                            return { done: true, value: undefined };
                        }
                        await event_1.Event.toPromise(this._onStateChanged.event);
                    } while (true);
                }
            };
        }
        static map(iterable, mapFn) {
            return new AsyncIterableObject(async (emitter) => {
                for await (const item of iterable) {
                    emitter.emitOne(mapFn(item));
                }
            });
        }
        map(mapFn) {
            return AsyncIterableObject.map(this, mapFn);
        }
        static filter(iterable, filterFn) {
            return new AsyncIterableObject(async (emitter) => {
                for await (const item of iterable) {
                    if (filterFn(item)) {
                        emitter.emitOne(item);
                    }
                }
            });
        }
        filter(filterFn) {
            return AsyncIterableObject.filter(this, filterFn);
        }
        static coalesce(iterable) {
            return AsyncIterableObject.filter(iterable, item => !!item);
        }
        coalesce() {
            return AsyncIterableObject.coalesce(this);
        }
        static async toPromise(iterable) {
            const result = [];
            for await (const item of iterable) {
                result.push(item);
            }
            return result;
        }
        toPromise() {
            return AsyncIterableObject.toPromise(this);
        }
        /**
         * The value will be appended at the end.
         *
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        emitOne(value) {
            if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            // it is important to add new values at the end,
            // as we may have iterators already running on the array
            this._results.push(value);
            this._onStateChanged.fire();
        }
        /**
         * The values will be appended at the end.
         *
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        emitMany(values) {
            if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            // it is important to add new values at the end,
            // as we may have iterators already running on the array
            this._results = this._results.concat(values);
            this._onStateChanged.fire();
        }
        /**
         * Calling `resolve()` will mark the result array as complete.
         *
         * **NOTE** `resolve()` must be called, otherwise all consumers of this iterable will hang indefinitely, similar to a non-resolved promise.
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        resolve() {
            if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            this._state = 1 /* AsyncIterableSourceState.DoneOK */;
            this._onStateChanged.fire();
        }
        /**
         * Writing an error will permanently invalidate this iterable.
         * The current users will receive an error thrown, as will all future users.
         *
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        reject(error) {
            if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            this._state = 2 /* AsyncIterableSourceState.DoneError */;
            this._error = error;
            this._onStateChanged.fire();
        }
    }
    exports.AsyncIterableObject = AsyncIterableObject;
    class CancelableAsyncIterableObject extends AsyncIterableObject {
        constructor(_source, executor) {
            super(executor);
            this._source = _source;
        }
        cancel() {
            this._source.cancel();
        }
    }
    exports.CancelableAsyncIterableObject = CancelableAsyncIterableObject;
    function createCancelableAsyncIterable(callback) {
        const source = new cancellation_1.CancellationTokenSource();
        const innerIterable = callback(source.token);
        return new CancelableAsyncIterableObject(source, async (emitter) => {
            const subscription = source.token.onCancellationRequested(() => {
                subscription.dispose();
                source.dispose();
                emitter.reject(new errors_1.CancellationError());
            });
            try {
                for await (const item of innerIterable) {
                    if (source.token.isCancellationRequested) {
                        // canceled in the meantime
                        return;
                    }
                    emitter.emitOne(item);
                }
                subscription.dispose();
                source.dispose();
            }
            catch (err) {
                subscription.dispose();
                source.dispose();
                emitter.reject(err);
            }
        });
    }
    exports.createCancelableAsyncIterable = createCancelableAsyncIterable;
    class AsyncIterableSource {
        constructor() {
            this._deferred = new DeferredPromise();
            this._asyncIterable = new AsyncIterableObject(emitter => {
                if (earlyError) {
                    emitter.reject(earlyError);
                    return;
                }
                if (earlyItems) {
                    emitter.emitMany(earlyItems);
                }
                this._errorFn = (error) => emitter.reject(error);
                this._emitFn = (item) => emitter.emitOne(item);
                return this._deferred.p;
            });
            let earlyError;
            let earlyItems;
            this._emitFn = (item) => {
                if (!earlyItems) {
                    earlyItems = [];
                }
                earlyItems.push(item);
            };
            this._errorFn = (error) => {
                if (!earlyError) {
                    earlyError = error;
                }
            };
        }
        get asyncIterable() {
            return this._asyncIterable;
        }
        resolve() {
            this._deferred.complete();
        }
        reject(error) {
            this._errorFn(error);
            this._deferred.complete();
        }
        emitOne(item) {
            this._emitFn(item);
        }
    }
    exports.AsyncIterableSource = AsyncIterableSource;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2FzeW5jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxTQUFnQixVQUFVLENBQUksR0FBWTtRQUN6QyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksT0FBUSxHQUE2QixDQUFDLElBQUksS0FBSyxVQUFVLENBQUM7SUFDM0UsQ0FBQztJQUZELGdDQUVDO0lBTUQsU0FBZ0IsdUJBQXVCLENBQUksUUFBa0Q7UUFDNUYsTUFBTSxNQUFNLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO1FBRTdDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbEQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQzlELFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdkIsTUFBTSxDQUFDLElBQUksMEJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3RDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdkIsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUNSLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdkIsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNqQixN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
//# sourceURL=../../../vs/base/common/async.js
})
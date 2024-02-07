/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform"], function (require, exports, event_1, lifecycle_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.originalGlobalValues = exports.runWithFakedTimers = exports.AsyncSchedulerProcessor = exports.TimeTravelScheduler = void 0;
    class SimplePriorityQueue {
        constructor(items, compare) {
            this.compare = compare;
            this.isSorted = false;
            this.items = items;
        }
        get length() {
            return this.items.length;
        }
        add(value) {
            this.items.push(value);
            this.isSorted = false;
        }
        remove(value) {
            this.items.splice(this.items.indexOf(value), 1);
            this.isSorted = false;
        }
        removeMin() {
            this.ensureSorted();
            return this.items.shift();
        }
        getMin() {
            this.ensureSorted();
            return this.items[0];
        }
        toSortedArray() {
            this.ensureSorted();
            return [...this.items];
        }
        ensureSorted() {
            if (!this.isSorted) {
                this.items.sort(this.compare);
                this.isSorted = true;
            }
        }
    }
    function compareScheduledTasks(a, b) {
        if (a.time !== b.time) {
            // Prefer lower time
            return a.time - b.time;
        }
        if (a.id !== b.id) {
            // Prefer lower id
            return a.id - b.id;
        }
        return 0;
    }
    class TimeTravelScheduler {
        constructor() {
            this.taskCounter = 0;
            this._now = 0;
            this.queue = new SimplePriorityQueue([], compareScheduledTasks);
            this.taskScheduledEmitter = new event_1.Emitter();
            this.onTaskScheduled = this.taskScheduledEmitter.event;
        }
        schedule(task) {
            if (task.time < this._now) {
                throw new Error(`Scheduled time (${task.time}) must be equal to or greater than the current time (${this._now}).`);
            }
            const extendedTask = { ...task, id: this.taskCounter++ };
            this.queue.add(extendedTask);
            this.taskScheduledEmitter.fire({ task });
            return { dispose: () => this.queue.remove(extendedTask) };
        }
        get now() {
            return this._now;
        }
        get hasScheduledTasks() {
            return this.queue.length > 0;
        }
        getScheduledTasks() {
            return this.queue.toSortedArray();
        }
        runNext() {
            const task = this.queue.removeMin();
            if (task) {
                this._now = task.time;
                task.run();
            }
            return task;
        }
        installGlobally() {
            return overwriteGlobals(this);
        }
    }
    exports.TimeTravelScheduler = TimeTravelScheduler;
    class AsyncSchedulerProcessor extends lifecycle_1.Disposable {
        get history() { return this._history; }
        constructor(scheduler, options) {
            super();
            this.scheduler = scheduler;
            this.isProcessing = false;
            this._history = new Array();
            this.queueEmptyEmitter = new event_1.Emitter();
            this.onTaskQueueEmpty = this.queueEmptyEmitter.event;
            this.maxTaskCount = options && options.maxTaskCount ? options.maxTaskCount : 100;
            this.useSetImmediate = options && options.useSetImmediate ? options.useSetImmediate : false;
            this._register(scheduler.onTaskScheduled(() => {
                if (this.isProcessing) {
                    return;
                }
                else {
                    this.isProcessing = true;
                    this.schedule();
                }
            }));
        }
        schedule() {
            // This allows promises created by a previous task to settle and schedule tasks before the next task is run.
            // Tasks scheduled in those promises might have to run before the current next task.
            Promise.resolve().then(() => {
                if (this.useSetImmediate) {
                    exports.originalGlobalValues.setImmediate(() => this.process());
                }
                else if (platform_1.setTimeout0IsFaster) {
                    (0, platform_1.setTimeout0)(() => this.process());
                }
                else {
                    exports.originalGlobalValues.setTimeout(() => this.process());
                }
            });
        }
        process() {
            const executedTask = this.scheduler.runNext();
            if (executedTask) {
                this._history.push(executedTask);
                if (this.history.length >= this.maxTaskCount && this.scheduler.hasScheduledTasks) {
                    const lastTasks = this._history.slice(Math.max(0, this.history.length - 10)).map(h => `${h.source.toString()}: ${h.source.stackTrace}`);
                    const e = new Error(`Queue did not get empty after processing ${this.history.length} items. These are the last ${lastTasks.length} scheduled tasks:\n${lastTasks.join('\n\n\n')}`);
                    this.lastError = e;
                    throw e;
                }
            }
            if (this.scheduler.hasScheduledTasks) {
                this.schedule();
            }
            else {
                this.isProcessing = false;
                this.queueEmptyEmitter.fire();
            }
        }
        waitForEmptyQueue() {
            if (this.lastError) {
                const error = this.lastError;
                this.lastError = undefined;
                throw error;
            }
            if (!this.isProcessing) {
                return Promise.resolve();
            }
            else {
                return event_1.Event.toPromise(this.onTaskQueueEmpty).then(() => {
                    if (this.lastError) {
                        throw this.lastError;
                    }
                });
            }
        }
    }
    exports.AsyncSchedulerProcessor = AsyncSchedulerProcessor;
    async function runWithFakedTimers(options, fn) {
        const useFakeTimers = options.useFakeTimers === undefined ? true : options.useFakeTimers;
        if (!useFakeTimers) {
            return fn();
        }
        const scheduler = new TimeTravelScheduler();
        const schedulerProcessor = new AsyncSchedulerProcessor(scheduler, { useSetImmediate: options.useSetImmediate, maxTaskCount: options.maxTaskCount });
        const globalInstallDisposable = scheduler.installGlobally();
        let result;
        try {
            result = await fn();
        }
        finally {
            globalInstallDisposable.dispose();
            try {
                // We process the remaining scheduled tasks.
                // The global override is no longer active, so during this, no more tasks will be scheduled.
                await schedulerProcessor.waitForEmptyQueue();
            }
            finally {
                schedulerProcessor.dispose();
            }
        }
        return result;
    }
    exports.runWithFakedTimers = runWithFakedTimers;
    exports.originalGlobalValues = {
        setTimeout: globalThis.setTimeout.bind(globalThis),
        clearTimeout: globalThis.clearTimeout.bind(globalThis),
        setInterval: globalThis.setInterval.bind(globalThis),
        clearInterval: globalThis.clearInterval.bind(globalThis),
        setImmediate: globalThis.setImmediate?.bind(globalThis),
        clearImmediate: globalThis.clearImmediate?.bind(globalThis),
        requestAnimationFrame: globalThis.requestAnimationFrame?.bind(globalThis),
        cancelAnimationFrame: globalThis.cancelAnimationFrame?.bind(globalThis),
        Date: globalThis.Date,
    };
    function setTimeout(scheduler, handler, timeout = 0) {
        if (typeof handler === 'string') {
            throw new Error('String handler args should not be used and are not supported');
        }
        return scheduler.schedule({
            time: scheduler.now + timeout,
            run: () => {
                handler();
            },
            source: {
                toString() { return 'setTimeout'; },
                stackTrace: new Error().stack,
            }
        });
    }
    function setInterval(scheduler, handler, interval) {
        if (typeof handler === 'string') {
            throw new Error('String handler args should not be used and are not supported');
        }
        const validatedHandler = handler;
        let iterCount = 0;
        const stackTrace = new Error().stack;
        let disposed = false;
        let lastDisposable;
        function schedule() {
            iterCount++;
            const curIter = iterCount;
            lastDisposable = scheduler.schedule({
                time: scheduler.now + interval,
                run() {
                    if (!disposed) {
                        schedule();
                        validatedHandler();
                    }
                },
                source: {
                    toString() { return `setInterval (iteration ${curIter})`; },
                    stackTrace,
                }
            });
        }
        schedule();
        return {
            dispose: () => {
                if (disposed) {
                    return;
                }
                disposed = true;
                lastDisposable.dispose();
            }
        };
    }
    function overwriteGlobals(scheduler) {
        globalThis.setTimeout = ((handler, timeout) => setTimeout(scheduler, handler, timeout));
        globalThis.clearTimeout = (timeoutId) => {
            if (typeof timeoutId === 'object' && timeoutId && 'dispose' in timeoutId) {
                timeoutId.dispose();
            }
            else {
                exports.originalGlobalValues.clearTimeout(timeoutId);
            }
        };
        globalThis.setInterval = ((handler, timeout) => setInterval(scheduler, handler, timeout));
        globalThis.clearInterval = (timeoutId) => {
            if (typeof timeoutId === 'object' && timeoutId && 'dispose' in timeoutId) {
                timeoutId.dispose();
            }
            else {
                exports.originalGlobalValues.clearInterval(timeoutId);
            }
        };
        globalThis.Date = createDateClass(scheduler);
        return {
            dispose: () => {
                Object.assign(globalThis, exports.originalGlobalValues);
            }
        };
    }
    function createDateClass(scheduler) {
        const OriginalDate = exports.originalGlobalValues.Date;
        function SchedulerDate(...args) {
            // the Date constructor called as a function, ref Ecma-262 Edition 5.1, section 15.9.2.
            // This remains so in the 10th edition of 2019 as well.
            if (!(this instanceof SchedulerDate)) {
                return new OriginalDate(scheduler.now).toString();
            }
            // if Date is called as a constructor with 'new' keyword
            if (args.length === 0) {
                return new OriginalDate(scheduler.now);
            }
            return new OriginalDate(...args);
        }
        for (const prop in OriginalDate) {
            if (OriginalDate.hasOwnProperty(prop)) {
                SchedulerDate[prop] = OriginalDate[prop];
            }
        }
        SchedulerDate.now = function now() {
            return scheduler.now;
        };
        SchedulerDate.toString = function toString() {
            return OriginalDate.toString();
        };
        SchedulerDate.prototype = OriginalDate.prototype;
        SchedulerDate.parse = OriginalDate.parse;
        SchedulerDate.UTC = OriginalDate.UTC;
        SchedulerDate.prototype.toUTCString = OriginalDate.prototype.toUTCString;
        return SchedulerDate;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZVRyYXZlbFNjaGVkdWxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi90aW1lVHJhdmVsU2NoZWR1bGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRyxNQUFNLG1CQUFtQjtRQUl4QixZQUFZLEtBQVUsRUFBbUIsT0FBK0I7WUFBL0IsWUFBTyxHQUFQLE9BQU8sQ0FBd0I7WUFIaEUsYUFBUSxHQUFHLEtBQUssQ0FBQztZQUl4QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNwQixDQUFDO1FBRUQsSUFBSSxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMxQixDQUFDO1FBRUQsR0FBRyxDQUFDLEtBQVE7WUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN2QixDQUFDO1FBRUQsTUFBTSxDQUFDLEtBQVE7WUFDZCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN2QixDQUFDO1FBRUQsU0FBUztZQUNSLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNwQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVELE1BQU07WUFDTCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDcEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFFRCxhQUFhO1lBQ1os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
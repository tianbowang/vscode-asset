/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/lifecycle", "vs/base/common/observableInternal/base", "vs/base/common/observableInternal/logging"], function (require, exports, assert_1, lifecycle_1, base_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.autorunDelta = exports.AutorunObserver = exports.autorunWithStore = exports.autorunWithStoreHandleChanges = exports.autorunHandleChanges = exports.autorunOpts = exports.autorun = void 0;
    /**
     * Runs immediately and whenever a transaction ends and an observed observable changed.
     * {@link fn} should start with a JS Doc using `@description` to name the autorun.
     */
    function autorun(fn) {
        return new AutorunObserver(undefined, fn, undefined, undefined);
    }
    exports.autorun = autorun;
    /**
     * Runs immediately and whenever a transaction ends and an observed observable changed.
     * {@link fn} should start with a JS Doc using `@description` to name the autorun.
     */
    function autorunOpts(options, fn) {
        return new AutorunObserver(options.debugName, fn, undefined, undefined);
    }
    exports.autorunOpts = autorunOpts;
    /**
     * Runs immediately and whenever a transaction ends and an observed observable changed.
     * {@link fn} should start with a JS Doc using `@description` to name the autorun.
     *
     * Use `createEmptyChangeSummary` to create a "change summary" that can collect the changes.
     * Use `handleChange` to add a reported change to the change summary.
     * The run function is given the last change summary.
     * The change summary is discarded after the run function was called.
     *
     * @see autorun
     */
    function autorunHandleChanges(options, fn) {
        return new AutorunObserver(options.debugName, fn, options.createEmptyChangeSummary, options.handleChange);
    }
    exports.autorunHandleChanges = autorunHandleChanges;
    /**
     * @see autorunHandleChanges (but with a disposable store that is cleared before the next run or on dispose)
     */
    function autorunWithStoreHandleChanges(options, fn) {
        const store = new lifecycle_1.DisposableStore();
        const disposable = autorunHandleChanges({
            debugName: options.debugName ?? (() => (0, base_1.getFunctionName)(fn)),
            createEmptyChangeSummary: options.createEmptyChangeSummary,
            handleChange: options.handleChange,
        }, (reader, changeSummary) => {
            store.clear();
            fn(reader, changeSummary, store);
        });
        return (0, lifecycle_1.toDisposable)(() => {
            disposable.dispose();
            store.dispose();
        });
    }
    exports.autorunWithStoreHandleChanges = autorunWithStoreHandleChanges;
    /**
     * @see autorun (but with a disposable store that is cleared before the next run or on dispose)
     */
    function autorunWithStore(fn) {
        const store = new lifecycle_1.DisposableStore();
        const disposable = autorunOpts({
            debugName: () => (0, base_1.getFunctionName)(fn) || '(anonymous)',
        }, reader => {
            store.clear();
            fn(reader, store);
        });
        return (0, lifecycle_1.toDisposable)(() => {
            disposable.dispose();
            store.dispose();
        });
    }
    exports.autorunWithStore = autorunWithStore;
    var AutorunState;
    (function (AutorunState) {
        /**
         * A dependency could have changed.
         * We need to explicitly ask them if at least one dependency changed.
         */
        AutorunState[AutorunState["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
        /**
         * A dependency changed and we need to recompute.
         */
        AutorunState[AutorunState["stale"] = 2] = "stale";
        AutorunState[AutorunState["upToDate"] = 3] = "upToDate";
    })(AutorunState || (AutorunState = {}));
    class AutorunObserver {
        get debugName() {
            if (typeof this._debugName === 'string') {
                return this._debugName;
            }
            if (typeof this._debugName === 'function') {
                const name = this._debugName();
                if (name !== undefined) {
                    return name;
                }
            }
            const name = (0, base_1.getFunctionName)(this._runFn);
            if (name !== undefined) {
                return name;
            }
            return '(anonymous)';
        }
        constructor(_debugName, _runFn, createChangeSummary, _handleChange) {
            this._debugName = _debugName;
            this._runFn = _runFn;
            this.createChangeSummary = createChangeSummary;
            this._handleChange = _handleChange;
            this.state = 2 /* AutorunState.stale */;
            this.updateCount = 0;
            this.disposed = false;
            this.dependencies = new Set();
            this.dependenciesToBeRemoved = new Set();
            this.changeSummary = this.createChangeSummary?.();
            (0, logging_1.getLogger)()?.handleAutorunCreated(this);
            this._runIfNeeded();
            (0, lifecycle_1.trackDisposable)(this);
        }
        dispose() {
            this.disposed = true;
            for (const o of this.dependencies) {
                o.removeObserver(this);
            }
            this.dependencies.clear();
            (0, lifecycle_1.markAsDisposed)(this);
        }
        _runIfNeeded() {
            if (this.state === 3 /* AutorunState.upToDate */) {
                return;
            }
            const emptySet = this.dependenciesToBeRemoved;
            this.dependenciesToBeRemoved = this.dependencies;
            this.dependencies = emptySet;
            this.state = 3 /* AutorunState.upToDate */;
            const isDisposed = this.disposed;
            try {
                if (!isDisposed) {
                    (0, logging_1.getLogger)()?.handleAutorunTriggered(this);
                    const changeSummary = this.changeSummary;
                    this.changeSummary = this.createChangeSummary?.();
                    this._runFn(this, changeSummary);
                }
            }
            finally {
                if (!isDisposed) {
                    (0, logging_1.getLogger)()?.handleAutorunFinished(this);
                }
                // We don't want our observed observables to think that they are (not even temporarily) not being observed.
                // Thus, we only unsubscribe from observables that are definitely not read anymore.
                for (const o of this.dependenciesToBeRemoved) {
                    o.removeObserver(this);
                }
                this.dependenciesToBeRemoved.clear();
            }
        }
        toString() {
            return `Autorun<${this.debugName}>`;
        }
        // IObserver implementation
        beginUpdate() {
            if (this.state === 3 /* AutorunState.upToDate */) {
                this.state = 1 /* AutorunState.dependenciesMightHaveChanged */;
            }
            this.updateCount++;
        }
        endUpdate() {
            if (this.updateCount === 1) {
                do {
                    if (this.state === 1 /* AutorunState.dependenciesMightHaveChanged */) {
                        this.state = 3 /* AutorunState.upToDate */;
                        for (const d of this.dependencies) {
                            d.reportChanges();
                            if (this.state === 2 /* AutorunState.stale */) {
                                // The other dependencies will refresh on demand
                                break;
                            }
                        }
                    }
                    this._runIfNeeded();
                } while (this.state !== 3 /* AutorunState.upToDate */);
            }
            this.updateCount--;
            (0, assert_1.assertFn)(() => this.updateCount >= 0);
        }
        handlePossibleChange(observable) {
            if (this.state === 3 /* AutorunState.upToDate */ && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
                this.state = 1 /* AutorunState.dependenciesMightHaveChanged */;
            }
        }
        handleChange(observable, change) {
            if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
                const shouldReact = this._handleChange ? this._handleChange({
                    changedObservable: observable,
                    change,
                    didChange: o => o === observable,
                }, this.changeSummary) : true;
                if (shouldReact) {
                    this.state = 2 /* AutorunState.stale */;
                }
            }
        }
        // IReader implementation
        readObservable(observable) {
            // In case the run action disposes the autorun
            if (this.disposed) {
                return observable.get();
            }
            observable.addObserver(this);
            const value = observable.get();
            this.dependencies.add(observable);
            this.dependenciesToBeRemoved.delete(observable);
            return value;
        }
    }
    exports.AutorunObserver = AutorunObserver;
    (function (autorun) {
        autorun.Observer = AutorunObserver;
    })(autorun || (exports.autorun = autorun = {}));
    function autorunDelta(observable, handler) {
        let _lastValue;
        return autorunOpts({ debugName: () => (0, base_1.getFunctionName)(handler) }, (reader) => {
            const newValue = observable.read(reader);
            const lastValue = _lastValue;
            _lastValue = newValue;
            handler({ lastValue, newValue });
        });
    }
    exports.autorunDelta = autorunDelta;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3J1bi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vb2JzZXJ2YWJsZUludGVybmFsL2F1dG9ydW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHOzs7T0FHRztJQUNILFNBQWdCLE9BQU8sQ0FBQyxFQUE2QjtRQUNwRCxPQUFPLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFGRCwwQkFFQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLFdBQVcsQ0FBQyxPQUE0RCxFQUFFLEVBQTZCO1FBQ3RILE9BQU8sSUFBSSxlQUFlLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFGRCxrQ0FFQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSCxTQUFnQixvQkFBb0IsQ0FDbkMsT0FJQyxFQUNELEVBQTREO1FBRTVELE9BQU8sSUFBSSxlQUFlLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLHdCQUF3QixFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMzRyxDQUFDO0lBVEQsb0RBU0M7SUFFRDs7T0FFRztJQUNILFNBQWdCLDZCQUE2QixDQUM1QyxPQUlDLEVBQ0QsRUFBb0Y7UUFFcEYsTUFBTSxLQUFLLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFDcEMsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQ3RDO1lBQ0MsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFBLHNCQUFlLEVBQUMsRUFBRSxDQUFDLENBQUM7WUFDM0Qsd0JBQXdCLEVBQUUsT0FBTyxDQUFD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
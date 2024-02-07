/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/observable", "vs/base/common/observableInternal/base", "vs/base/test/common/utils"], function (require, exports, assert, event_1, observable_1, base_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoggingObservableValue = exports.LoggingObserver = void 0;
    suite('observables', () => {
        const ds = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        /**
         * Reads these tests to understand how to use observables.
         */
        suite('tutorial', () => {
            test('observable + autorun', () => {
                const log = new Log();
                // This creates a new observable value. The name is only used for debugging purposes.
                // The second arg is the initial value.
                const myObservable = (0, observable_1.observableValue)('myObservable', 0);
                // This creates an autorun. The @description is only used for debugging purposes.
                // The autorun has to be disposed! This is very important.
                ds.add((0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    // This code is run immediately.
                    // Use the `reader` to read observable values and track the dependency to them.
                    // If you use `observable.get()` instead of `observable.read(reader)`, you will just
                    // get the value and not track the dependency.
                    log.log(`myAutorun.run(myObservable: ${myObservable.read(reader)})`);
                    // Now that all dependencies are tracked, the autorun is re-run whenever any of the
                    // dependencies change.
                }));
                // The autorun runs immediately
                assert.deepStrictEqual(log.getAndClearEntries(), ['myAutorun.run(myObservable: 0)']);
                // We set the observable.
                myObservable.set(1, undefined);
                // -> The autorun runs again when any read observable changed
                assert.deepStrictEqual(log.getAndClearEntries(), ['myAutorun.run(myObservable: 1)']);
                // We set the observable again.
                myObservable.set(1, undefined);
                // -> The autorun does not run again, because the observable didn't change.
                assert.deepStrictEqual(log.getAndClearEntries(), []);
                // Transactions batch autorun runs
                (0, observable_1.transaction)((tx) => {
                    myObservable.set(2, tx);
                    // No auto-run ran yet, even though the value changed!
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    myObservable.set(3, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                // Only at the end of the transaction the autorun re-runs
                assert.deepStrictEqual(log.getAndClearEntries(), ['myAutorun.run(myObservable: 3)']);
                // Note that the autorun did not see the intermediate value `2`!
            });
            test('derived + autorun', () => {
                const log = new Log();
                const observable1 = (0, observable_1.observableValue)('myObservable1', 0);
                const observable2 = (0, observable_1.observableValue)('myObservable2', 0);
                // A derived value is an observable that is derived from other observables.
                const myDerived = (0, observable_1.derived)(reader => {
                    /** @description myDerived */
                    const value1 = observable1.read(reader); // Use the reader to track dependencies.
                    const value2 = observable2.read(reader);
                    const sum = value1 + value2;
                    log.log(`myDerived.recompute: ${value1} + ${value2} = ${sum}`);
                    return sum;
                });
                // We create an autorun that reacts on changes to our derived value.
                ds.add((0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    // Autoruns work with observable values and deriveds - in short, they work with any observable.
                    log.log(`myAutorun(myDerived: ${myDerived.read(reader)})`);
                }));
                // autorun runs immediately
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: 0 + 0 = 0",
                    "myAutorun(myDerived: 0)",
                ]);
                observable1.set(1, undefined);
                // and on changes...
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: 1 + 0 = 1",
                    "myAutorun(myDerived: 1)",
                ]);
                observable2.set(1, undefined);
                // ... of any dependency.
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: 1 + 1 = 2",
                    "myAutorun(myDerived: 2)",
                ]);
                // Now we change multiple observables in a transaction to batch process the effects.
                (0, observable_1.transaction)((tx) => {
                    observable1.set(5, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    observable2.set(5, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                // When changing multiple observables in a transaction,
                // deriveds are only recomputed on demand.
                // (Note that you cannot see the intermediate value when `obs1 == 5` and `obs2 == 1`)
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: 5 + 5 = 10",
                    "myAutorun(myDerived: 10)",
                ]);
                (0, observable_1.transaction)((tx) => {
                    observable1.set(6, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    observable2.set(4, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                // Now the autorun didn't run again, because its dependency changed from 10 to 10 (= no change).
                assert.deepStrictEqual(log.getAndClearEntries(), (["myDerived.recompute: 6 + 4 = 10"]));
            });
            test('read during transaction', () => {
                const log = new Log();
                const observable1 = (0, observable_1.observableValue)('myObservable1', 0);
                const observable2 = (0, observable_1.observableValue)('myObservable2', 0);
                const myDerived = (0, observable_1.derived)((reader) => {
                    /** @description myDerived */
                    const value1 = observable1.read(reader);
                    const value2 = observable2.read(reader);
                    const sum = value1 + value2;
                    log.log(`myDerived.recompute: ${value1} + ${value2} = ${sum}`);
                    return sum;
                });
                ds.add((0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    log.log(`myAutorun(myDerived: ${myDerived.read(reader)})`);
                }));
                // autorun runs immediately
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: 0 + 0 = 0",
                    "myAutorun(myDerived: 0)",
                ]);
                (0, observable_1.transaction)((tx) => {
                    observable1.set(-10, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    myDerived.get(); // This forces a (sync) recomputation of the current value!
                    assert.deepStrictEqual(log.getAndClearEntries(), (["myDerived.recompute: -10 + 0 = -10"]));
                    // This means, that even in transactions you can assume that all values you can read with `get` and `read` are up-to-date.
                    // Read these values just might cause additional (potentially unneeded) recomputations.
                    observable2.set(10, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                // This autorun runs again, because its dependency changed from 0 to -10 and then back to 0.
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.recompute: -10 + 10 = 0",
                    "myAutorun(myDerived: 0)",
                ]);
            });
            test('get without observers', () => {
                const log = new Log();
                const observable1 = (0, observable_1.observableValue)('myObservableValue1', 0);
                // We set up some computeds.
                const computed1 = (0, observable_1.derived)((reader) => {
                    /** @description computed */
                    const value1 = observable1.read(reader);
                    const result = value1 % 3;
                    log.log(`recompute1: ${value1} % 3 = ${result}`);
                    return result;
                });
                const computed2 = (0, observable_1.derived)((reader) => {
                    /** @description computed */
                    const value1 = computed1.read(reader);
                    const result = value1 * 2;
                    log.log(`recompute2: ${value1} * 2 = ${result}`);
                    return result;
                });
                const computed3 = (0, observable_1.derived)((reader) => {
                    /** @description computed */
                    const value1 = computed1.read(reader);
                    const result = value1 * 3;
                    log.log(`recompute3: ${value1} * 3 = ${result}`);
                    return result;
                });
                const computedSum = (0, observable_1.derived)((reader) => {
                    /** @description computed */
                    const value1 = computed2.read(reader);
                    const value2 = computed3.read(reader);
                    const result = value1 + value2;
                    log.log(`recompute4: ${value1} + ${value2} = ${result}`);
                    return result;
                });
                assert.deepStrictEqual(log.getAndClearEntries(), []);
                observable1.set(1, undefined);
                assert.deepStrictEqual(log.getAndClearEntries(), []);
                // And now read the computed that dependens on all the others.
                log.log(`value: ${computedSum.get()}`);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'recompute1: 1 % 3 = 1',
                    'recompute2: 1 * 2 = 2',
                    'recompute3: 1 * 3 = 3',
                    'recompute4: 2 + 3 = 5',
                    'value: 5',
                ]);
                log.log(`value: ${computedSum.get()}`);
                // Because there are no observers, the derived values are not cached (!), but computed from scratch.
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'recompute1: 1 % 3 = 1',
                    'recompute2: 1 * 2 = 2',
                    'recompute3: 1 * 3 = 3',
                    'recompute4: 2 + 3 = 5',
                    'value: 5',
                ]);
                const disposable = (0, observable_1.keepObserved)(computedSum); // Use keepObserved to keep the cache.
                // You can also use `computedSum.keepObserved(store)` for an inline experience.
                log.log(`value: ${computedSum.get()}`);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'recompute1: 1 % 3 = 1',
                    'recompute2: 1 * 2 = 2',
                    'recompute3: 1 * 3 = 3',
                    'recompute4: 2 + 3 = 5',
                    'value: 5',
                ]);
                log.log(`value: ${computedSum.get()}`);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'value: 5',
                ]);
                // Tada, no recomputations!
                observable1.set(2, undefined);
                // The keepObserved does not force deriveds to be recomputed! They are still lazy.
                assert.deepStrictEqual(log.getAndClearEntries(), ([]));
                log.log(`value: ${computedSum.get()}`);
                // Those deriveds are recomputed on demand, i.e. when someone reads them.
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "recompute1: 2 % 3 = 2",
                    "recompute2: 2 * 2 = 4",
                    "recompute3: 2 * 3 = 6",
                    "recompute4: 4 + 6 = 10",
                    "value: 10",
                ]);
                log.log(`value: ${computedSum.get()}`);
                // ... and then cached again
                assert.deepStrictEqual(log.getAndClearEntries(), (["value: 10"]));
                disposable.dispose(); // Don't forget to dispose the keepAlive to prevent memory leaks!
                log.log(`value: ${computedSum.get()}`);
                // Which disables the cache again
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "recompute1: 2 % 3 = 2",
                    "recompute2: 2 * 2 = 4",
                    "recompute3: 2 * 3 = 6",
                    "recompute4: 4 + 6 = 10",
                    "value: 10",
                ]);
                log.log(`value: ${computedSum.get()}`);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "recompute1: 2 % 3 = 2",
                    "recompute2: 2 * 2 = 4",
                    "recompute3: 2 * 3 = 6",
                    "recompute4: 4 + 6 = 10",
                    "value: 10",
                ]);
                // Why don't we just always keep the cache alive?
                // This is because in order to keep the cache alive, we have to keep our subscriptions to our dependencies alive,
                // which could cause memory-leaks.
                // So instead, when the last observer of a derived is disposed, we dispose our subscriptions to our dependencies.
                // `keepObserved` just prevents this from happening.
            });
            // That is the end of the tutorial.
            // There are lots of utilities you can explore now, like `observableFromEvent`, `Event.fromObservableLight`,
            // autorunWithStore, observableWithStore and so on.
        });
        test('topological order', () => {
            const log = new Log();
            const myObservable1 = (0, observable_1.observableValue)('myObservable1', 0);
            const myObservable2 = (0, observable_1.observableValue)('myObservable2', 0);
            const myComputed1 = (0, observable_1.derived)(reader => {
                /** @description myComputed1 */
                const value1 = myObservable1.read(reader);
                const value2 = myObservable2.read(reader);
                const sum = value1 + value2;
                log.log(`myComputed1.recompute(myObservable1: ${value1} + myObservable2: ${value2} = ${sum})`);
                return sum;
            });
            const myComputed2 = (0, observable_1.derived)(reader => {
                /** @description myComputed2 */
                const value1 = myComputed1.read(reader);
                const value2 = myObservable1.read(reader);
                const value3 = myObservable2.read(reader);
                const sum = value1 + value2 + value3;
                log.log(`myComputed2.recompute(myComputed1: ${value1} + myObservable1: ${value2} + myObservable2: ${value3} = ${sum})`);
                return sum;
            });
            const myComputed3 = (0, observable_1.derived)(reader => {
                /** @description myComputed3 */
                const value1 = myComputed2.read(reader);
                const value2 = myObservable1.read(reader);
                const value3 = myObservable2.read(reader);
                const sum = value1 + value2 + value3;
                log.log(`myComputed3.recompute(myComputed2: ${value1} + myObservable1: ${value2} + myObservable2: ${value3} = ${sum})`);
                return sum;
            });
            ds.add((0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                log.log(`myAutorun.run(myComputed3: ${myComputed3.read(reader)})`);
            }));
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myComputed1.recompute(myObservable1: 0 + myObservable2: 0 = 0)",
                "myComputed2.recompute(myComputed1: 0 + myObservable1: 0 + myObservable2: 0 = 0)",
                "myComputed3.recompute(myComputed2: 0 + myObservable1: 0 + myObservable2: 0 = 0)",
                "myAutorun.run(myComputed3: 0)",
            ]);
            myObservable1.set(1, undefined);
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myComputed1.recompute(myObservable1: 1 + myObservable2: 0 = 1)",
                "myComputed2.recompute(myComputed1: 1 + myObservable1: 1 + myObservable2: 0 = 2)",
                "myComputed3.recompute(myComputed2: 2 + myObservable1: 1 + myObservable2: 0 = 3)",
                "myAutorun.run(myComputed3: 3)",
            ]);
            (0, observable_1.transaction)((tx) => {
                myObservable1.set(2, tx);
                myComputed2.get();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myComputed1.recompute(myObservable1: 2 + myObservable2: 0 = 2)",
                    "myComputed2.recompute(myComputed1: 2 + myObservable1: 2 + myObservable2: 0 = 4)",
                ]);
                myObservable1.set(3, tx);
                myComputed2.get();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myComputed1.recompute(myObservable1: 3 + myObservable2: 0 = 3)",
                    "myComputed2.recompute(myComputed1: 3 + myObservable1: 3 + myObservable2: 0 = 6)",
                ]);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myComputed3.recompute(myComputed2: 6 + myObservable1: 3 + myObservable2: 0 = 9)",
                "myAutorun.run(myComputed3: 9)",
            ]);
        });
        suite('from event', () => {
            function init() {
                const log = new Log();
                let value = 0;
                const eventEmitter = new event_1.Emitter();
                let id = 0;
                const observable = (0, observable_1.observableFromEvent)((handler) => {
                    const curId = id++;
                    log.log(`subscribed handler ${curId}`);
                    const disposable = eventEmitter.event(handler);
                    return {
                        dispose: () => {
                            log.log(`unsubscribed handler ${curId}`);
                            disposable.dispose();
                        },
                    };
                }, () => {
                    log.log(`compute value ${value}`);
                    return value;
                });
                return {
                    log,
                    setValue: (newValue) => {
                        value = newValue;
                        eventEmitter.fire();
                    },
                    observable,
                };
            }
            test('Handle undefined', () => {
                const { log, setValue, observable } = init();
                setValue(undefined);
                const autorunDisposable = (0, observable_1.autorun)(reader => {
                    /** @description MyAutorun */
                    observable.read(reader);
                    log.log(`autorun, value: ${observable.read(reader)}`);
                });
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "subscribed handler 0",
                    "compute value undefined",
                    "autorun, value: undefined",
                ]);
                setValue(1);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "compute value 1",
                    "autorun, value: 1"
                ]);
                autorunDisposable.dispose();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "unsubscribed handler 0"
                ]);
            });
            test('basic', () => {
                const { log, setValue, observable } = init();
                const shouldReadObservable = (0, observable_1.observableValue)('shouldReadObservable', true);
                const autorunDisposable = (0, observable_1.autorun)(reader => {
                    /** @description MyAutorun */
                    if (shouldReadObservable.read(reader)) {
                        observable.read(reader);
                        log.log(`autorun, should read: true, value: ${observable.read(reader)}`);
                    }
                    else {
                        log.log(`autorun, should read: false`);
                    }
                });
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'subscribed handler 0',
                    'compute value 0',
                    'autorun, should read: true, value: 0',
                ]);
                // Cached get
                log.log(`get value: ${observable.get()}`);
                assert.deepStrictEqual(log.getAndClearEntries(), ['get value: 0']);
                setValue(1);
                // Trigger autorun, no unsub/sub
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'compute value 1',
                    'autorun, should read: true, value: 1',
                ]);
                // Unsubscribe when not read
                shouldReadObservable.set(false, undefined);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'autorun, should read: false',
                    'unsubscribed handler 0',
                ]);
                shouldReadObservable.set(true, undefined);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'subscribed handler 1',
                    'compute value 1',
                    'autorun, should read: true, value: 1',
                ]);
                autorunDisposable.dispose();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'unsubscribed handler 1',
                ]);
            });
            test('get without observers', () => {
                const { log, observable } = init();
                assert.deepStrictEqual(log.getAndClearEntries(), []);
                log.log(`get value: ${observable.get()}`);
                // Not cached or subscribed
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'compute value 0',
                    'get value: 0',
                ]);
                log.log(`get value: ${observable.get()}`);
                // Still not cached or subscribed
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    'compute value 0',
                    'get value: 0',
                ]);
            });
        });
        test('reading derived in transaction unsubscribes unnecessary observables', () => {
            const log = new Log();
            const shouldReadObservable = (0, observable_1.observableValue)('shouldReadMyObs1', true);
            const myObs1 = new LoggingObservableValue('myObs1', 0, log);
            const myComputed = (0, observable_1.derived)(reader => {
                /** @description myComputed */
                log.log('myComputed.recompute');
                if (shouldReadObservable.read(reader)) {
                    return myObs1.read(reader);
                }
                return 1;
            });
            ds.add((0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const value = myComputed.read(reader);
                log.log(`myAutorun: ${value}`);
            }));
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myComputed.recompute",
                "myObs1.firstObserverAdded",
                "myObs1.get",
                "myAutorun: 0",
            ]);
            (0, observable_1.transaction)(tx => {
                myObs1.set(1, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), (["myObs1.set (value 1)"]));
                shouldReadObservable.set(false, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), ([]));
                myComputed.get();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myComputed.recompute",
                    "myObs1.lastObserverRemoved",
                ]);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), (["myAutorun: 1"]));
        });
        test('avoid recomputation of deriveds that are no longer read', () => {
            const log = new Log();
            const myObsShouldRead = new LoggingObservableValue('myObsShouldRead', true, log);
            const myObs1 = new LoggingObservableValue('myObs1', 0, log);
            const myComputed1 = (0, observable_1.derived)(reader => {
                /** @description myComputed1 */
                const myObs1Val = myObs1.read(reader);
                const result = myObs1Val % 10;
                log.log(`myComputed1(myObs1: ${myObs1Val}): Computed ${result}`);
                return myObs1Val;
            });
            ds.add((0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const shouldRead = myObsShouldRead.read(reader);
                if (shouldRead) {
                    const v = myComputed1.read(reader);
                    log.log(`myAutorun(shouldRead: true, myComputed1: ${v}): run`);
                }
                else {
                    log.log(`myAutorun(shouldRead: false): run`);
                }
            }));
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObsShouldRead.firstObserverAdded",
                "myObsShouldRead.get",
                "myObs1.firstObserverAdded",
                "myObs1.get",
                "myComputed1(myObs1: 0): Computed 0",
                "myAutorun(shouldRead: true, myComputed1: 0): run",
            ]);
            (0, observable_1.transaction)(tx => {
                myObsShouldRead.set(false, tx);
                myObs1.set(1, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObsShouldRead.set (value false)",
                    "myObs1.set (value 1)",
                ]);
            });
            // myComputed1 should not be recomputed here, even though its dependency myObs1 changed!
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObsShouldRead.get",
                "myAutorun(shouldRead: false): run",
                "myObs1.lastObserverRemoved",
            ]);
            (0, observable_1.transaction)(tx => {
                myObsShouldRead.set(true, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObsShouldRead.set (value true)",
                ]);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObsShouldRead.get",
                "myObs1.firstObserverAdded",
                "myObs1.get",
                "myComputed1(myObs1: 1): Computed 1",
                "myAutorun(shouldRead: true, myComputed1: 1): run",
            ]);
        });
        suite('autorun rerun on neutral change', () => {
            test('autorun reruns on neutral observable double change', () => {
                const log = new Log();
                const myObservable = (0, observable_1.observableValue)('myObservable', 0);
                ds.add((0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    log.log(`myAutorun.run(myObservable: ${myObservable.read(reader)})`);
                }));
                assert.deepStrictEqual(log.getAndClearEntries(), ['myAutorun.run(myObservable: 0)']);
                (0, observable_1.transaction)((tx) => {
                    myObservable.set(2, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    myObservable.set(0, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                assert.deepStrictEqual(log.getAndClearEntries(), ['myAutorun.run(myObservable: 0)']);
            });
            test('autorun does not rerun on indirect neutral observable double change', () => {
                const log = new Log();
                const myObservable = (0, observable_1.observableValue)('myObservable', 0);
                const myDerived = (0, observable_1.derived)(reader => {
                    /** @description myDerived */
                    const val = myObservable.read(reader);
                    log.log(`myDerived.read(myObservable: ${val})`);
                    return val;
                });
                ds.add((0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    log.log(`myAutorun.run(myDerived: ${myDerived.read(reader)})`);
                }));
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.read(myObservable: 0)",
                    "myAutorun.run(myDerived: 0)"
                ]);
                (0, observable_1.transaction)((tx) => {
                    myObservable.set(2, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    myObservable.set(0, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.read(myObservable: 0)"
                ]);
            });
            test('autorun reruns on indirect neutral observable double change when changes propagate', () => {
                const log = new Log();
                const myObservable = (0, observable_1.observableValue)('myObservable', 0);
                const myDerived = (0, observable_1.derived)(reader => {
                    /** @description myDerived */
                    const val = myObservable.read(reader);
                    log.log(`myDerived.read(myObservable: ${val})`);
                    return val;
                });
                ds.add((0, observable_1.autorun)(reader => {
                    /** @description myAutorun */
                    log.log(`myAutorun.run(myDerived: ${myDerived.read(reader)})`);
                }));
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.read(myObservable: 0)",
                    "myAutorun.run(myDerived: 0)"
                ]);
                (0, observable_1.transaction)((tx) => {
                    myObservable.set(2, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                    myDerived.get(); // This marks the auto-run as changed
                    assert.deepStrictEqual(log.getAndClearEntries(), [
                        "myDerived.read(myObservable: 2)"
                    ]);
                    myObservable.set(0, tx);
                    assert.deepStrictEqual(log.getAndClearEntries(), []);
                });
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myDerived.read(myObservable: 0)",
                    "myAutorun.run(myDerived: 0)"
                ]);
            });
        });
        test('self-disposing autorun', () => {
            const log = new Log();
            const observable1 = new LoggingObservableValue('myObservable1', 0, log);
            const myObservable2 = new LoggingObservableValue('myObservable2', 0, log);
            const myObservable3 = new LoggingObservableValue('myObservable3', 0, log);
            const d = (0, observable_1.autorun)(reader => {
                /** @description autorun */
                if (observable1.read(reader) >= 2) {
                    assert.deepStrictEqual(log.getAndClearEntries(), [
                        "myObservable1.set (value 2)",
                        "myObservable1.get",
                    ]);
                    myObservable2.read(reader);
                    // First time this observable is read
                    assert.deepStrictEqual(log.getAndClearEntries(), [
                        "myObservable2.firstObserverAdded",
                        "myObservable2.get",
                    ]);
                    d.dispose();
                    // Disposing removes all observers
                    assert.deepStrictEqual(log.getAndClearEntries(), [
                        "myObservable1.lastObserverRemoved",
                        "myObservable2.lastObserverRemoved",
                    ]);
                    myObservable3.read(reader);
                    // This does not subscribe the observable, because the autorun is disposed
                    assert.deepStrictEqual(log.getAndClearEntries(), [
                        "myObservable3.get",
                    ]);
                }
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                'myObservable1.firstObserverAdded',
                'myObservable1.get',
            ]);
            observable1.set(1, undefined);
            assert.deepStrictEqual(log.getAndClearEntries(), [
                'myObservable1.set (value 1)',
                'myObservable1.get',
            ]);
            observable1.set(2, undefined);
            // See asserts in the autorun
            assert.deepStrictEqual(log.getAndClearEntries(), ([]));
        });
        test('changing observables in endUpdate', () => {
            const log = new Log();
            const myObservable1 = new LoggingObservableValue('myObservable1', 0, log);
            const myObservable2 = new LoggingObservableValue('myObservable2', 0, log);
            const myDerived1 = (0, observable_1.derived)(reader => {
                /** @description myDerived1 */
                const val = myObservable1.read(reader);
                log.log(`myDerived1.read(myObservable: ${val})`);
                return val;
            });
            const myDerived2 = (0, observable_1.derived)(reader => {
                /** @description myDerived2 */
                const val = myObservable2.read(reader);
                if (val === 1) {
                    myDerived1.read(reader);
                }
                log.log(`myDerived2.read(myObservable: ${val})`);
                return val;
            });
            ds.add((0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const myDerived1Val = myDerived1.read(reader);
                const myDerived2Val = myDerived2.read(reader);
                log.log(`myAutorun.run(myDerived1: ${myDerived1Val}, myDerived2: ${myDerived2Val})`);
            }));
            (0, observable_1.transaction)(tx => {
                myObservable2.set(1, tx);
                // end update of this observable will trigger endUpdate of myDerived1 and
                // the autorun and the autorun will add myDerived2 as observer to myDerived1
                myObservable1.set(1, tx);
            });
        });
        test('set dependency in derived', () => {
            const log = new Log();
            const myObservable = new LoggingObservableValue('myObservable', 0, log);
            const myComputed = (0, observable_1.derived)(reader => {
                /** @description myComputed */
                let value = myObservable.read(reader);
                const origValue = value;
                log.log(`myComputed(myObservable: ${origValue}): start computing`);
                if (value % 3 !== 0) {
                    value++;
                    myObservable.set(value, undefined);
                }
                log.log(`myComputed(myObservable: ${origValue}): finished computing`);
                return value;
            });
            ds.add((0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const value = myComputed.read(reader);
                log.log(`myAutorun(myComputed: ${value})`);
            }));
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.firstObserverAdded",
                "myObservable.get",
                "myComputed(myObservable: 0): start computing",
                "myComputed(myObservable: 0): finished computing",
                "myAutorun(myComputed: 0)"
            ]);
            myObservable.set(1, undefined);
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.set (value 1)",
                "myObservable.get",
                "myComputed(myObservable: 1): start computing",
                "myObservable.set (value 2)",
                "myComputed(myObservable: 1): finished computing",
                "myObservable.get",
                "myComputed(myObservable: 2): start computing",
                "myObservable.set (value 3)",
                "myComputed(myObservable: 2): finished computing",
                "myObservable.get",
                "myComputed(myObservable: 3): start computing",
                "myComputed(myObservable: 3): finished computing",
                "myAutorun(myComputed: 3)",
            ]);
        });
        test('set dependency in autorun', () => {
            const log = new Log();
            const myObservable = new LoggingObservableValue('myObservable', 0, log);
            ds.add((0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const value = myObservable.read(reader);
                log.log(`myAutorun(myObservable: ${value}): start`);
                if (value !== 0 && value < 4) {
                    myObservable.set(value + 1, undefined);
                }
                log.log(`myAutorun(myObservable: ${value}): end`);
            }));
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.firstObserverAdded",
                "myObservable.get",
                "myAutorun(myObservable: 0): start",
                "myAutorun(myObservable: 0): end",
            ]);
            myObservable.set(1, undefined);
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.set (value 1)",
                "myObservable.get",
                "myAutorun(myObservable: 1): start",
                "myObservable.set (value 2)",
                "myAutorun(myObservable: 1): end",
                "myObservable.get",
                "myAutorun(myObservable: 2): start",
                "myObservable.set (value 3)",
                "myAutorun(myObservable: 2): end",
                "myObservable.get",
                "myAutorun(myObservable: 3): start",
                "myObservable.set (value 4)",
                "myAutorun(myObservable: 3): end",
                "myObservable.get",
                "myAutorun(myObservable: 4): start",
                "myAutorun(myObservable: 4): end",
            ]);
        });
        test('get in transaction between sets', () => {
            const log = new Log();
            const myObservable = new LoggingObservableValue('myObservable', 0, log);
            const myDerived1 = (0, observable_1.derived)(reader => {
                /** @description myDerived1 */
                const value = myObservable.read(reader);
                log.log(`myDerived1(myObservable: ${value}): start computing`);
                return value;
            });
            const myDerived2 = (0, observable_1.derived)(reader => {
                /** @description myDerived2 */
                const value = myDerived1.read(reader);
                log.log(`myDerived2(myDerived1: ${value}): start computing`);
                return value;
            });
            ds.add((0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const value = myDerived2.read(reader);
                log.log(`myAutorun(myDerived2: ${value})`);
            }));
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.firstObserverAdded",
                "myObservable.get",
                "myDerived1(myObservable: 0): start computing",
                "myDerived2(myDerived1: 0): start computing",
                "myAutorun(myDerived2: 0)",
            ]);
            (0, observable_1.transaction)(tx => {
                myObservable.set(1, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObservable.set (value 1)",
                ]);
                myDerived2.get();
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObservable.get",
                    "myDerived1(myObservable: 1): start computing",
                    "myDerived2(myDerived1: 1): start computing",
                ]);
                myObservable.set(2, tx);
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObservable.set (value 2)",
                ]);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable.get",
                "myDerived1(myObservable: 2): start computing",
                "myDerived2(myDerived1: 2): start computing",
                "myAutorun(myDerived2: 2)",
            ]);
        });
        test('bug: Dont reset states', () => {
            const log = new Log();
            const myObservable1 = new LoggingObservableValue('myObservable1', 0, log);
            const myObservable2 = new LoggingObservableValue('myObservable2', 0, log);
            const myDerived2 = (0, observable_1.derived)(reader => {
                /** @description myDerived2 */
                const val = myObservable2.read(reader);
                log.log(`myDerived2.computed(myObservable2: ${val})`);
                return val % 10;
            });
            const myDerived3 = (0, observable_1.derived)(reader => {
                /** @description myDerived3 */
                const val1 = myObservable1.read(reader);
                const val2 = myDerived2.read(reader);
                log.log(`myDerived3.computed(myDerived1: ${val1}, myDerived2: ${val2})`);
                return `${val1} + ${val2}`;
            });
            ds.add((0, observable_1.autorun)(reader => {
                /** @description myAutorun */
                const val = myDerived3.read(reader);
                log.log(`myAutorun(myDerived3: ${val})`);
            }));
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable1.firstObserverAdded",
                "myObservable1.get",
                "myObservable2.firstObserverAdded",
                "myObservable2.get",
                "myDerived2.computed(myObservable2: 0)",
                "myDerived3.computed(myDerived1: 0, myDerived2: 0)",
                "myAutorun(myDerived3: 0 + 0)",
            ]);
            (0, observable_1.transaction)(tx => {
                myObservable1.set(1, tx); // Mark myDerived 3 as stale
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObservable1.set (value 1)",
                ]);
                myObservable2.set(10, tx); // This is a non-change. myDerived3 should not be marked as possibly-depedency-changed!
                assert.deepStrictEqual(log.getAndClearEntries(), [
                    "myObservable2.set (value 10)",
                ]);
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                "myObservable1.get",
                "myObservable2.get",
                "myDerived2.computed(myObservable2: 10)",
                'myDerived3.computed(myDerived1: 1, myDerived2: 0)',
                'myAutorun(myDerived3: 1 + 0)',
            ]);
        });
        test('bug: Add observable in endUpdate', () => {
            const myObservable1 = (0, observable_1.observableValue)('myObservable1', 0);
            const myObservable2 = (0, observable_1.observableValue)('myObservable2', 0);
            const myDerived1 = (0, observable_1.derived)(reader => {
                /** @description myDerived1 */
                return myObservable1.read(reader);
            });
            const myDerived2 = (0, observable_1.derived)(reader => {
                /** @description myDerived2 */
                return myObservable2.read(reader);
            });
            const myDerivedA1 = (0, observable_1.derived)(reader => /** @description myDerivedA1 */ {
                const d1 = myDerived1.read(reader);
                if (d1 === 1) {
                    // This adds an observer while myDerived is still in update mode.
                    // When myDerived exits update mode, the observer shouldn't receive
                    // more endUpdate than beginUpdate calls.
                    myDerived2.read(reader);
                }
            });
            ds.add((0, observable_1.autorun)(reader => {
                /** @description myAutorun1 */
                myDerivedA1.read(reader);
            }));
            ds.add((0, observable_1.autorun)(reader => {
                /** @description myAutorun2 */
                myDerived2.read(reader);
            }));
            (0, observable_1.transaction)(tx => {
                myObservable1.set(1, tx);
                myObservable2.set(1, tx);
            });
        });
        test('bug: fromObservableLight doesnt subscribe', () => {
            const log = new Log();
            const myObservable = new LoggingObservableValue('myObservable', 0, log);
            const myDerived = (0, observable_1.derived)(reader => /** @description myDerived */ {
                const val = myObservable.read(reader);
                log.log(`myDerived.computed(myObservable2: ${val})`);
                return val % 10;
            });
            const e = event_1.Event.fromObservableLight(myDerived);
            log.log('event created');
            e(() => {
                log.log('event fired');
            });
            myObservable.set(1, undefined);
            assert.deepStrictEqual(log.getAndClearEntries(), [
                'event created',
                'myObservable.firstObserverAdded',
                'myObservable.get',
                'myDerived.computed(myObservable2: 0)',
                'myObservable.set (value 1)',
                'myObservable.get',
                'myDerived.computed(myObservable2: 1)',
                'event fired',
            ]);
        });
        test('dont run autorun after dispose', () => {
            const log = new Log();
            const myObservable = new LoggingObservableValue('myObservable', 0, log);
            const d = (0, observable_1.autorun)(reader => {
                /** @description update */
                const v = myObservable.read(reader);
                log.log('autorun, myObservable:' + v);
            });
            (0, observable_1.transaction)(tx => {
                myObservable.set(1, tx);
                d.dispose();
            });
            assert.deepStrictEqual(log.getAndClearEntries(), [
                'myObservable.firstObserverAdded',
                'myObservable.get',
                'autorun, myObservable:0',
                'myObservable.set (value 1)',
                'myObservable.lastObserverRemoved',
            ]);
        });
    });
    class LoggingObserver {
        constructor(debugName, log) {
            this.debugName = debugName;
            this.log = log;
            this.count = 0;
        }
        beginUpdate(observable) {
            this.count++;
            this.log.log(`${this.debugName}.beginUpdate (count ${this.count})`);
        }
        endUpdate(observable) {
            this.log.log(`${this.debugName}.endUpdate (count ${this.count})`);
            this.count--;
        }
        handleChange(observable, change) {
            this.log.log(`${this.debugName}.handleChange (count ${this.count})`);
        }
        handlePossibleChange(observable) {
            this.log.log(`${this.debugName}.handlePossibleChange`);
        }
    }
    exports.LoggingObserver = LoggingObserver;
    class LoggingObservableValue extends base_1.BaseObservable {
        constructor(debugName, initialValue, log) {
            super();
            this.debugName = debugName;
            this.log = log;
            this.value = initialValue;
        }
        onFirstObserverAdded() {
            this.log.log(`${this.debugName}.firstObserverAdded`);
        }
        onLastObserverRemoved() {
            this.log.log(`${this.debugName}.lastObserverRemoved`);
        }
        get() {
            this.log.log(`${this.debugName}.get`);
            return this.value;
        }
        set(value, tx, change) {
            if (this.value === value) {
                return;
            }
            if (!tx) {
                (0, observable_1.transaction)((tx) => {
                    this.set(value, tx, change);
                }, () => `Setting ${this.debugName}`);
                return;
            }
            this.log.log(`${this.debugName}.set (value ${value})`);
            this.value = value;
            for (const observer of this.observers) {
                tx.updateObserver(observer, this);
                observer.handleChange(this, change);
            }
        }
        toString() {
            return `${this.debugName}: ${this.value}`;
        }
    }
    exports.LoggingObservableValue = LoggingObservableValue;
    class Log {
        constructor() {
            this.entries = [];
        }
        log(message) {
            this.entries.push(message);
        }
        getAndClearEntries() {
            const entries = [...this.entries];
            this.entries.length = 0;
            return entries;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YWJsZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvY29tbW9uL29ic2VydmFibGUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7UUFDekIsTUFBTSxFQUFFLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRXJEOztXQUVHO1FBQ0gsS0FBSyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7WUFDdEIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtnQkFDakMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDdEIscUZBQXFGO2dCQUNyRix1Q0FBdUM7Z0JBQ3ZDLE1BQU0sWUFBWSxHQUFHLElBQUEsNEJBQWUsRUFBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRXhELGlGQUFpRjtnQkFDakYsMERBQTBEO2dCQUMxRCxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUEsb0JBQU8sRUFBQyxNQUFNLENBQUMsRUFBRTtvQkFDdkIsNkJBQTZCO29CQUU3QixnQ0FBZ0M7b0JBRWhDLCtFQUErRTtvQkFDL0Usb0ZBQW9GO29CQUNwRiw4Q0FBOEM7b0JBQzlDLEdBQUcsQ0FBQyxHQUFHLENBQUMsK0JBQStCLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUVyRSxtRkFBbUY7b0JBQ25GLHVCQUF1QjtnQkFDeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDSiwrQkFBK0I7Z0JBQy9CLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7Z0JBRXJGLHlCQUF5QjtnQkFDekIsWUFBWSxD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
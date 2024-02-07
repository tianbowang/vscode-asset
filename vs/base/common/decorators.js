(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.throttle = exports.debounce = exports.memoize = void 0;
    function createDecorator(mapFn) {
        return (target, key, descriptor) => {
            let fnKey = null;
            let fn = null;
            if (typeof descriptor.value === 'function') {
                fnKey = 'value';
                fn = descriptor.value;
            }
            else if (typeof descriptor.get === 'function') {
                fnKey = 'get';
                fn = descriptor.get;
            }
            if (!fn) {
                throw new Error('not supported');
            }
            descriptor[fnKey] = mapFn(fn, key);
        };
    }
    function memoize(_target, key, descriptor) {
        let fnKey = null;
        let fn = null;
        if (typeof descriptor.value === 'function') {
            fnKey = 'value';
            fn = descriptor.value;
            if (fn.length !== 0) {
                console.warn('Memoize should only be used in functions with zero parameters');
            }
        }
        else if (typeof descriptor.get === 'function') {
            fnKey = 'get';
            fn = descriptor.get;
        }
        if (!fn) {
            throw new Error('not supported');
        }
        const memoizeKey = `$memoize$${key}`;
        descriptor[fnKey] = function (...args) {
            if (!this.hasOwnProperty(memoizeKey)) {
                Object.defineProperty(this, memoizeKey, {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: fn.apply(this, args)
                });
            }
            return this[memoizeKey];
        };
    }
    exports.memoize = memoize;
    function debounce(delay, reducer, initialValueProvider) {
        return createDecorator((fn, key) => {
            const timerKey = `$debounce$${key}`;
            const resultKey = `$debounce$result$${key}`;
            return function (...args) {
                if (!this[resultKey]) {
                    this[resultKey] = initialValueProvider ? initialValueProvider() : undefined;
                }
                clearTimeout(this[timerKey]);
                if (reducer) {
                    this[resultKey] = reducer(this[resultKey], ...args);
                    args = [this[resultKey]];
                }
                this[timerKey] = setTimeout(() => {
                    fn.apply(this, args);
                    this[resultKey] = initialValueProvider ? initialValueProvider() : undefined;
                }, delay);
            };
        });
    }
    exports.debounce = debounce;
    function throttle(delay, reducer, initialValueProvider) {
        return createDecorator((fn, key) => {
            const timerKey = `$throttle$timer$${key}`;
            const resultKey = `$throttle$result$${key}`;
            const lastRunKey = `$throttle$lastRun$${key}`;
            const pendingKey = `$throttle$pending$${key}`;
            return function (...args) {
                if (!this[resultKey]) {
                    this[resultKey] = initialValueProvider ? initialValueProvider() : undefined;
                }
                if (this[lastRunKey] === null || this[lastRunKey] === undefined) {
                    this[lastRunKey] = -Number.MAX_VALUE;
                }
                if (reducer) {
                    this[resultKey] = reducer(this[resultKey], ...args);
                }
                if (this[pendingKey]) {
                    return;
                }
                const nextTime = this[lastRunKey] + delay;
                if (nextTime <= Date.now()) {
                    this[lastRunKey] = Date.now();
                    fn.apply(this, [this[resultKey]]);
                    this[resultKey] = initialValueProvider ? initialValueProvider() : undefined;
                }
                else {
                    this[pendingKey] = true;
                    this[timerKey] = setTimeout(() => {
                        this[pendingKey] = false;
                        this[lastRunKey] = Date.now();
                        fn.apply(this, [this[resultKey]]);
                        this[resultKey] = initialValueProvider ? initialValueProvider() : undefined;
                    }, nextTime - Date.now());
                }
            };
        });
    }
    exports.throttle = throttle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vZGVjb3JhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEcsU0FBUyxlQUFlLENBQUMsS0FBOEM7UUFDdEUsT0FBTyxDQUFDLE1BQVcsRUFBRSxHQUFXLEVBQUUsVUFBZSxFQUFFLEVBQUU7WUFDcEQsSUFBSSxLQUFLLEdBQWtCLElBQUksQ0FBQztZQUNoQyxJQUFJLEVBQUUsR0FBb0IsSUFBSSxDQUFDO1lBRS9CLElBQUksT0FBTyxVQUFVLENBQUMsS0FBSyxLQUFLLFVBQVUsRUFBRSxDQUFDO2dCQUM1QyxLQUFLLEdBQUcsT0FBTyxDQUFDO2dCQUNoQixFQUFFLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztZQUN2QixDQUFDO2lCQUFNLElBQUksT0FBTyxVQUFVLENBQUMsR0FBRyxLQUFLLFVBQVUsRUFBRSxDQUFDO2dCQUNqRCxLQUFLLEdBQUcsS0FBSyxDQUFDO2dCQUNkLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDO1lBQ3JCLENBQUM7WUFFRCxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBRUQsVUFBVSxDQUFDLEtBQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQWdCLE9BQU8sQ0FBQyxPQUFZLEVBQUUsR0FBVyxFQUFFLFVBQWU7UUFDakUsSUFBSSxLQUFLLEdBQWtCLElBQUksQ0FBQztRQUNoQyxJQUFJLEVBQUUsR0FBb0IsSUFBSSxDQUFDO1FBRS9CLElBQUksT0FBTyxVQUFVLENBQUMsS0FBSyxLQUFLLFVBQVUsRUFBRSxD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
//# sourceURL=../../../vs/base/common/decorators.js
})
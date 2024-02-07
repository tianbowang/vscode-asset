/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation"], function (require, exports, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CachedFunction = exports.LRUCachedFunction = exports.Cache = void 0;
    class Cache {
        constructor(task) {
            this.task = task;
            this.result = null;
        }
        get() {
            if (this.result) {
                return this.result;
            }
            const cts = new cancellation_1.CancellationTokenSource();
            const promise = this.task(cts.token);
            this.result = {
                promise,
                dispose: () => {
                    this.result = null;
                    cts.cancel();
                    cts.dispose();
                }
            };
            return this.result;
        }
    }
    exports.Cache = Cache;
    /**
     * Uses a LRU cache to make a given parametrized function cached.
     * Caches just the last value.
     * The key must be JSON serializable.
    */
    class LRUCachedFunction {
        constructor(fn) {
            this.fn = fn;
            this.lastCache = undefined;
            this.lastArgKey = undefined;
        }
        get(arg) {
            const key = JSON.stringify(arg);
            if (this.lastArgKey !== key) {
                this.lastArgKey = key;
                this.lastCache = this.fn(arg);
            }
            return this.lastCache;
        }
    }
    exports.LRUCachedFunction = LRUCachedFunction;
    /**
     * Uses an unbounded cache (referential equality) to memoize the results of the given function.
    */
    class CachedFunction {
        get cachedValues() {
            return this._map;
        }
        constructor(fn) {
            this.fn = fn;
            this._map = new Map();
        }
        get(arg) {
            if (this._map.has(arg)) {
                return this._map.get(arg);
            }
            const value = this.fn(arg);
            this._map.set(arg, value);
            return value;
        }
    }
    exports.CachedFunction = CachedFunction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2NhY2hlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLEtBQUs7UUFHakIsWUFBb0IsSUFBMkM7WUFBM0MsU0FBSSxHQUFKLElBQUksQ0FBdUM7WUFEdkQsV0FBTSxHQUEwQixJQUFJLENBQUM7UUFDc0IsQ0FBQztRQUVwRSxHQUFHO1lBQ0YsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2pCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNwQixDQUFDO1lBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO1lBQzFDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxNQUFNLEdBQUc7Z0JBQ2IsT0FBTztnQkFDUCxPQUFPLEVBQUUsR0FBRyxFQUFFO29CQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUNuQixHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2IsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNmLENBQUM7YUFDRCxDQUFDO1lBRUYsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7S0FDRDtJQXhCRCxzQkF3QkM7SUFFRDs7OztNQUlFO0lBQ0YsTUFBYSxpQkFBaUI7UUFJN0IsWUFBNkIsRUFBNEI7WUFBNUIsT0FBRSxHQUFGLEVBQUUsQ0FBMEI7WUFIakQsY0FBUyxHQUEwQixTQUFTLENBQUM7WUFDN0MsZUFBVSxHQUF1QixTQUFTLENBQUM7UUFHbkQsQ0FBQztRQUVNLEdBQUcsQ0FBQyxHQUFTO1lBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEMsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxTQUFVLENBQUM7UUFDeEIsQ0FBQztLQUNEO0lBZkQsOENBZUM7SUFFRDs7TUFFRTtJQUNGLE1BQWEsY0FBYztRQUUxQixJQUFXLFlBQVk7WUFDdEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxZQUE2QixFQUF5QjtZQUF6QixPQUFFLEdBQUYsRUFBRSxDQUF1QjtZQUxyQyxTQUFJLEdBQUcsSUFBSSxHQUFHLEVBQWdCLENBQUM7UUFLVSxDQUFDO1FBRXBELEdBQUcsQ0FBQyxHQUFTO1lBQ25CLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQztZQUM1QixDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO0tBQ0Q7SUFoQkQsd0NBZ0JDIn0=
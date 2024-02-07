(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapFindFirst = exports.findMaxIdxBy = exports.findFirstMinBy = exports.findLastMaxBy = exports.findFirstMaxBy = exports.MonotonousArray = exports.findFirstIdxMonotonous = exports.findFirstIdxMonotonousOrArrLen = exports.findFirstMonotonous = exports.findLastIdxMonotonous = exports.findLastMonotonous = exports.findLastIdx = exports.findLast = void 0;
    function findLast(array, predicate, fromIdx) {
        const idx = findLastIdx(array, predicate);
        if (idx === -1) {
            return undefined;
        }
        return array[idx];
    }
    exports.findLast = findLast;
    function findLastIdx(array, predicate, fromIndex = array.length - 1) {
        for (let i = fromIndex; i >= 0; i--) {
            const element = array[i];
            if (predicate(element)) {
                return i;
            }
        }
        return -1;
    }
    exports.findLastIdx = findLastIdx;
    /**
     * Finds the last item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
     *
     * @returns `undefined` if no item matches, otherwise the last item that matches the predicate.
     */
    function findLastMonotonous(array, predicate) {
        const idx = findLastIdxMonotonous(array, predicate);
        return idx === -1 ? undefined : array[idx];
    }
    exports.findLastMonotonous = findLastMonotonous;
    /**
     * Finds the last item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
     *
     * @returns `startIdx - 1` if predicate is false for all items, otherwise the index of the last item that matches the predicate.
     */
    function findLastIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
        let i = startIdx;
        let j = endIdxEx;
        while (i < j) {
            const k = Math.floor((i + j) / 2);
            if (predicate(array[k])) {
                i = k + 1;
            }
            else {
                j = k;
            }
        }
        return i - 1;
    }
    exports.findLastIdxMonotonous = findLastIdxMonotonous;
    /**
     * Finds the first item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
     *
     * @returns `undefined` if no item matches, otherwise the first item that matches the predicate.
     */
    function findFirstMonotonous(array, predicate) {
        const idx = findFirstIdxMonotonousOrArrLen(array, predicate);
        return idx === array.length ? undefined : array[idx];
    }
    exports.findFirstMonotonous = findFirstMonotonous;
    /**
     * Finds the first item where predicate is true using binary search.
     * `predicate` must be monotonous, i.e. `arr.map(predicate)` must be like `[false, ..., false, true, ..., true]`!
     *
     * @returns `endIdxEx` if predicate is false for all items, otherwise the index of the first item that matches the predicate.
     */
    function findFirstIdxMonotonousOrArrLen(array, predicate, startIdx = 0, endIdxEx = array.length) {
        let i = startIdx;
        let j = endIdxEx;
        while (i < j) {
            const k = Math.floor((i + j) / 2);
            if (predicate(array[k])) {
                j = k;
            }
            else {
                i = k + 1;
            }
        }
        return i;
    }
    exports.findFirstIdxMonotonousOrArrLen = findFirstIdxMonotonousOrArrLen;
    function findFirstIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
        const idx = findFirstIdxMonotonousOrArrLen(array, predicate, startIdx, endIdxEx);
        return idx === array.length ? -1 : idx;
    }
    exports.findFirstIdxMonotonous = findFirstIdxMonotonous;
    /**
     * Use this when
     * * You have a sorted array
     * * You query this array with a monotonous predicate to find the last item that has a certain property.
     * * You query this array multiple times with monotonous predicates that get weaker and weaker.
     */
    class MonotonousArray {
        static { this.assertInvariants = false; }
        constructor(_array) {
            this._array = _array;
            this._findLastMonotonousLastIdx = 0;
        }
        /**
         * The predicate must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
         * For subsequent calls, current predicate must be weaker than (or equal to) the previous predicate, i.e. more entries must be `true`.
         */
        findLastMonotonous(predicate) {
            if (MonotonousArray.assertInvariants) {
                if (this._prevFindLastPredicate) {
                    for (const item of this._array) {
                        if (this._prevFindLastPredicate(item) && !predicate(item)) {
                            throw new Error('MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.');
                        }
                    }
                }
                this._prevFindLastPredicate = predicate;
            }
            const idx = findLastIdxMonotonous(this._array, predicate, this._findLastMonotonousLastIdx);
            this._findLastMonotonousLastIdx = idx + 1;
            return idx === -1 ? undefined : this._array[idx];
        }
    }
    exports.MonotonousArray = MonotonousArray;
    /**
     * Returns the first item that is equal to or greater than every other item.
    */
    function findFirstMaxBy(array, comparator) {
        if (array.length === 0) {
            return undefined;
        }
        let max = array[0];
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, max) > 0) {
                max = item;
            }
        }
        return max;
    }
    exports.findFirstMaxBy = findFirstMaxBy;
    /**
     * Returns the last item that is equal to or greater than every other item.
    */
    function findLastMaxBy(array, comparator) {
        if (array.length === 0) {
            return undefined;
        }
        let max = array[0];
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, max) >= 0) {
                max = item;
            }
        }
        return max;
    }
    exports.findLastMaxBy = findLastMaxBy;
    /**
     * Returns the first item that is equal to or less than every other item.
    */
    function findFirstMinBy(array, comparator) {
        return findFirstMaxBy(array, (a, b) => -comparator(a, b));
    }
    exports.findFirstMinBy = findFirstMinBy;
    function findMaxIdxBy(array, comparator) {
        if (array.length === 0) {
            return -1;
        }
        let maxIdx = 0;
        for (let i = 1; i < array.length; i++) {
            const item = array[i];
            if (comparator(item, array[maxIdx]) > 0) {
                maxIdx = i;
            }
        }
        return maxIdx;
    }
    exports.findMaxIdxBy = findMaxIdxBy;
    /**
     * Returns the first mapped value of the array which is not undefined.
     */
    function mapFindFirst(items, mapFn) {
        for (const value of items) {
            const mapped = mapFn(value);
            if (mapped !== undefined) {
                return mapped;
            }
        }
        return undefined;
    }
    exports.mapFindFirst = mapFindFirst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXlzRmluZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vYXJyYXlzRmluZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsU0FBZ0IsUUFBUSxDQUFJLEtBQW1CLEVBQUUsU0FBK0IsRUFBRSxPQUFnQjtRQUNqRyxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzFDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDaEIsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFORCw0QkFNQztJQUVELFNBQWdCLFdBQVcsQ0FBSSxLQUFtQixFQUFFLFNBQStCLEVBQUUsU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUNoSCxLQUFLLElBQUksQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDckMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXpCLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ3hCLE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztRQUNGLENBQUM7UUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQVZELGtDQVVDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixrQkFBa0IsQ0FBSSxLQUFtQixFQUFFLFNBQStCO1FBQ3pGLE1BQU0sR0FBRyxHQUFHLHFCQUFxQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNwRCxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUhELGdEQUdDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixxQkFBcUIsQ0FBSSxLQUFtQixFQUFFLFNBQStCLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU07UUFDbkksSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNkLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDekIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDWCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDRixDQUFDO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQVpELHNEQVlDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixtQkFBbUIsQ0FBSSxLQUFtQixFQUFFLFNBQStCO1FBQzFGLE1BQU0sR0FBRyxHQUFHLDhCQUE4QixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM3RCxPQUFPLEdBQUcsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBSEQsa0RBR0M7SUFFRDs7Ozs7T0FLRztJQUNILFNBQWdCLDhCQUE4QixDQUFJLEtBQW1CLEVBQUUsU0FBK0IsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTTtRQUM1SSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDakIsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ2QsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNsQyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN6QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1gsQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFaRCx3RUFZQztJQUVELFNBQWdCLHNCQUFzQixDQUFJLEtBQW1CLEVBQUUsU0FBK0IsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTTtRQUNwSSxNQUFNLEdBQUcsR0FBRyw4QkFBOEIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNqRixPQUFPLEdBQUcsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ3hDLENBQUM7SUFIRCx3REFHQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBYSxlQUFlO2lCQUNiLHFCQUFnQixHQUFHLEtBQUssQUFBUixDQUFTO1FBS3ZDLFlBQTZCLE1BQW9CO1lBQXBCLFdBQU0sR0FBTixNQUFNLENBQWM7WUFIekMsK0JBQTBCLEdBQUcsQ0FBQyxDQUFDO1FBSXZDLENBQUM7UUFFRDs7O1dBR0c7UUFDSCxrQkFBa0IsQ0FBQyxTQUErQjtZQUNqRCxJQUFJLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN0QyxJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO29CQUNqQyxLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDaEMsSUFBSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs0QkFDM0QsTUFBTSxJQUFJLEtBQUssQ0FBQyw4RkFBOEYsQ0FBQyxDQUFDO3dCQUNqSCxDQUFDO29CQUNGLENBQUM7Z0JBQ0YsQ0FBQztnQkFDRCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsU0FBUyxDQUFDO1lBQ3pDLENBQUM7WUFFRCxNQUFNLEdBQUcsR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsMEJBQTBCLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUMxQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELENBQUM7O0lBNUJGLDBDQTZCQztJQUVEOztNQUVFO0lBQ0YsU0FBZ0IsY0FBYyxDQUFJLEtBQW1CLEVBQUUsVUFBeUI7UUFDL0UsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2QyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMvQixHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ1osQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFiRCx3Q0FhQztJQUVEOztNQUVFO0lBQ0YsU0FBZ0IsYUFBYSxDQUFJLEtBQW1CLEVBQUUsVUFBeUI7UUFDOUUsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2QyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ1osQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFiRCxzQ0FhQztJQUVEOztNQUVFO0lBQ0YsU0FBZ0IsY0FBYyxDQUFJLEtBQW1CLEVBQUUsVUFBeUI7UUFDL0UsT0FBTyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUZELHdDQUVDO0lBRUQsU0FBZ0IsWUFBWSxDQUFJLEtBQW1CLEVBQUUsVUFBeUI7UUFDN0UsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO1FBRUQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2QyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN6QyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ1osQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFiRCxvQ0FhQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsWUFBWSxDQUFPLEtBQWtCLEVBQUUsS0FBa0M7UUFDeEYsS0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUMzQixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUIsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzFCLE9BQU8sTUFBTSxDQUFDO1lBQ2YsQ0FBQztRQUNGLENBQUM7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBVEQsb0NBU0MifQ==
//# sourceURL=../../../vs/base/common/arraysFind.js
})
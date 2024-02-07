/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "./arraysFind"], function (require, exports, errors_1, arraysFind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallbackIterable = exports.ArrayQueue = exports.reverseOrder = exports.booleanComparator = exports.numberComparator = exports.tieBreakComparators = exports.compareBy = exports.CompareResult = exports.splice = exports.insertInto = exports.getRandomElement = exports.asArray = exports.mapArrayOrNot = exports.pushMany = exports.pushToEnd = exports.pushToStart = exports.shuffle = exports.arrayInsert = exports.remove = exports.insert = exports.index = exports.range = exports.flatten = exports.commonPrefixLength = exports.lastOrDefault = exports.firstOrDefault = exports.uniqueFilter = exports.distinct = exports.isNonEmptyArray = exports.isFalsyOrEmpty = exports.move = exports.coalesceInPlace = exports.coalesce = exports.topAsync = exports.top = exports.delta = exports.sortedDiff = exports.forEachWithNeighbors = exports.forEachAdjacent = exports.groupAdjacentBy = exports.groupBy = exports.quickSelect = exports.binarySearch2 = exports.binarySearch = exports.removeFastWithoutKeepingOrder = exports.equals = exports.tail2 = exports.tail = void 0;
    /**
     * Returns the last element of an array.
     * @param array The array.
     * @param n Which element from the end (default is zero).
     */
    function tail(array, n = 0) {
        return array[array.length - (1 + n)];
    }
    exports.tail = tail;
    function tail2(arr) {
        if (arr.length === 0) {
            throw new Error('Invalid tail call');
        }
        return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
    }
    exports.tail2 = tail2;
    function equals(one, other, itemEquals = (a, b) => a === b) {
        if (one === other) {
            return true;
        }
        if (!one || !other) {
            return false;
        }
        if (one.length !== other.length) {
            return false;
        }
        for (let i = 0, len = one.length; i < len; i++) {
            if (!itemEquals(one[i], other[i])) {
                return false;
            }
        }
        return true;
    }
    exports.equals = equals;
    /**
     * Remove the element at `index` by replacing it with the last element. This is faster than `splice`
     * but changes the order of the array
     */
    function removeFastWithoutKeepingOrder(array, index) {
        const last = array.length - 1;
        if (index < last) {
            array[index] = array[last];
        }
        array.pop();
    }
    exports.removeFastWithoutKeepingOrder = removeFastWithoutKeepingOrder;
    /**
     * Performs a binary search algorithm over a sorted array.
     *
     * @param array The array being searched.
     * @param key The value we search for.
     * @param comparator A function that takes two array elements and returns zero
     *   if they are equal, a negative number if the first element precedes the
     *   second one in the sorting order, or a positive number if the second element
     *   precedes the first one.
     * @return See {@link binarySearch2}
     */
    function binarySearch(array, key, comparator) {
        return binarySearch2(array.length, i => comparator(array[i], key));
    }
    exports.binarySearch = binarySearch;
    /**
     * Performs a binary search algorithm over a sorted collection. Useful for cases
     * when we need to perform a binary search over something that isn't actually an
     * array, and converting data to an array would defeat the use of binary search
     * in the first place.
     *
     * @param length The collection length.
     * @param compareToKey A function that takes an index of an element in the
     *   collection and returns zero if the value at this index is equal to the
     *   search key, a negative number if the value precedes the search key in the
     *   sorting order, or a positive number if the search key precedes the value.
     * @return A non-negative index of an element, if found. If not found, the
     *   result is -(n+1) (or ~n, using bitwise notation), where n is the index
     *   where the key should be inserted to maintain the sorting order.
     */
    function binarySearch2(length, compareToKey) {
        let low = 0, high = length - 1;
        while (low <= high) {
            const mid = ((low + high) / 2) | 0;
            const comp = compareToKey(mid);
            if (comp < 0) {
                low = mid + 1;
            }
            else if (comp > 0) {
                high = mid - 1;
            }
            else {
                return mid;
            }
        }
        return -(low + 1);
    }
    exports.binarySearch2 = binarySearch2;
    function quickSelect(nth, data, compare) {
        nth = nth | 0;
        if (nth >= data.length) {
            throw new TypeError('invalid index');
        }
        const pivotValue = data[Math.floor(data.length * Math.random())];
        const lower = [];
        const higher = [];
        const pivots = [];
        for (const value of data) {
            const val = compare(value, pivotValue);
            if (val < 0) {
                lower.push(value);
            }
            else if (val > 0) {
                higher.push(value);
            }
            else {
                pivots.push(value);
            }
        }
        if (nth < lower.length) {
            return quickSelect(nth, lower, compare);
        }
        else if (nth < lower.length + pivots.length) {
            return pivots[0];
        }
        else {
            return quickSelect(nth - (lower.length + pivots.length), higher, compare);
        }
    }
    exports.quickSelect = quickSelect;
    function groupBy(data, compare) {
        const result = [];
        let currentGroup = undefined;
        for (const element of data.slice(0).sort(compare)) {
            if (!currentGroup || compare(currentGroup[0], element) !== 0) {
                currentGroup = [element];
                result.push(currentGroup);
            }
            else {
                currentGroup.push(element);
            }
        }
        return result;
    }
    exports.groupBy = groupBy;
    /**
     * Splits the given items into a list of (non-empty) groups.
     * `shouldBeGrouped` is used to decide if two consecutive items should be in the same group.
     * The order of the items is preserved.
     */
    function* groupAdjacentBy(items, shouldBeGrouped) {
        let currentGroup;
        let last;
        for (const item of items) {
            if (last !== undefined && shouldBeGrouped(last, item)) {
                currentGroup.push(item);
            }
            else {
                if (currentGroup) {
                    yield currentGroup;
                }
                currentGroup = [item];
            }
            last = item;
        }
        if (currentGroup) {
            yield currentGroup;
        }
    }
    exports.groupAdjacentBy = groupAdjacentBy;
    function forEachAdjacent(arr, f) {
        for (let i = 0; i <= arr.length; i++) {
            f(i === 0 ? undefined : arr[i - 1], i === arr.length ? undefined : arr[i]);
        }
    }
    exports.forEachAdjacent = forEachAdjacent;
    function forEachWithNeighbors(arr, f) {
        for (let i = 0; i < arr.length; i++) {
            f(i === 0 ? undefined : arr[i - 1], arr[i], i + 1 === arr.length ? undefined : arr[i + 1]);
        }
    }
    exports.forEachWithNeighbors = forEachWithNeighbors;
    /**
     * Diffs two *sorted* arrays and computes the splices which apply the diff.
     */
    function sortedDiff(before, after, compare) {
        const result = [];
        function pushSplice(start, deleteCount, toInsert) {
            if (deleteCount === 0 && toInsert.length === 0) {
                return;
            }
            const latest = result[result.length - 1];
            if (latest && latest.start + latest.deleteCount === start) {
                latest.deleteCount += deleteCount;
                latest.toInsert.push(...toInsert);
            }
            else {
                result.push({ start, deleteCount, toInsert });
            }
        }
        let beforeIdx = 0;
        let afterIdx = 0;
        while (true) {
            if (beforeIdx === before.length) {
                pushSplice(beforeIdx, 0, after.slice(afterIdx));
                break;
            }
            if (afterIdx === after.length) {
                pushSplice(beforeIdx, before.length - beforeIdx, []);
                break;
            }
            const beforeElement = before[beforeIdx];
            const afterElement = after[afterIdx];
            const n = compare(beforeElement, afterElement);
            if (n === 0) {
                // equal
                beforeIdx += 1;
                afterIdx += 1;
            }
            else if (n < 0) {
                // beforeElement is smaller -> before element removed
                pushSplice(beforeIdx, 1, []);
                beforeIdx += 1;
            }
            else if (n > 0) {
                // beforeElement is greater -> after element added
                pushSplice(beforeIdx, 0, [afterElement]);
                afterIdx += 1;
            }
        }
        return result;
    }
    exports.sortedDiff = sortedDiff;
    /**
     * Takes two *sorted* arrays and computes their delta (removed, added elements).
     * Finishes in `Math.min(before.length, after.length)` steps.
     */
    function delta(before, after, compare) {
        const splices = sortedDiff(before, after, compare);
        const removed = [];
        const added = [];
        for (const splice of splices) {
            removed.push(...before.slice(splice.start, splice.start + splice.deleteCount));
            added.push(...splice.toInsert);
        }
        return { removed, added };
    }
    exports.delta = delta;
    /**
     * Returns the top N elements from the array.
     *
     * Faster than sorting the entire array when the array is a lot larger than N.
     *
     * @param array The unsorted array.
     * @param compare A sort function for the elements.
     * @param n The number of elements to return.
     * @return The first n elements from array when sorted with compare.
     */
    function top(array, compare, n) {
        if (n === 0) {
            return [];
        }
        const result = array.slice(0, n).sort(compare);
        topStep(array, compare, result, n, array.length);
        return result;
    }
    exports.top = top;
    /**
     * Asynchronous variant of `top()` allowing for splitting up work in batches between which the event loop can run.
     *
     * Returns the top N elements from the array.
     *
     * Faster than sorting the entire array when the array is a lot larger than N.
     *
     * @param array The unsorted array.
     * @param compare A sort function for the elements.
     * @param n The number of elements to return.
     * @param batch The number of elements to examine before yielding to the event loop.
     * @return The first n elements from array when sorted with compare.
     */
    function topAsync(array, compare, n, batch, token) {
        if (n === 0) {
            return Promise.resolve([]);
        }
        return new Promise((resolve, reject) => {
            (async () => {
                const o = array.length;
                const result = array.slice(0, n).sort(compare);
                for (let i = n, m = Math.min(n + batch, o); i < o; i = m, m = Math.min(m + batch, o)) {
                    if (i > n) {
                        await new Promise(resolve => setTimeout(resolve)); // any other delay function would starve I/O
                    }
                    if (token && token.isCancellationRequested) {
                        throw new errors_1.CancellationError();
                    }
                    topStep(array, compare, result, i, m);
                }
                return result;
            })()
                .then(resolve, reject);
        });
    }
    exports.topAsync = topAsync;
    function topStep(array, compare, result, i, m) {
        for (const n = result.length; i < m; i++) {
            const element = array[i];
            if (compare(element, result[n - 1]) < 0) {
                result.pop();
                const j = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(result, e => compare(element, e) < 0);
                result.splice(j, 0, element);
            }
        }
    }
    /**
     * @returns New array with all falsy values removed. The original array IS NOT modified.
     */
    function coalesce(array) {
        return array.filter(e => !!e);
    }
    exports.coalesce = coalesce;
    /**
     * Remove all falsy values from `array`. The original array IS modified.
     */
    function coalesceInPlace(array) {
        let to = 0;
        for (let i = 0; i < array.length; i++) {
            if (!!array[i]) {
                array[to] = array[i];
                to += 1;
            }
        }
        array.length = to;
    }
    exports.coalesceInPlace = coalesceInPlace;
    /**
     * @deprecated Use `Array.copyWithin` instead
     */
    function move(array, from, to) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    }
    exports.move = move;
    /**
     * @returns false if the provided object is an array and not empty.
     */
    function isFalsyOrEmpty(obj) {
        return !Array.isArray(obj) || obj.length === 0;
    }
    exports.isFalsyOrEmpty = isFalsyOrEmpty;
    function isNonEmptyArray(obj) {
        return Array.isArray(obj) && obj.length > 0;
    }
    exports.isNonEmptyArray = isNonEmptyArray;
    /**
     * Removes duplicates from the given array. The optional keyFn allows to specify
     * how elements are checked for equality by returning an alternate value for each.
     */
    function distinct(array, keyFn = value => value) {
        const seen = new Set();
        return array.filter(element => {
            const key = keyFn(element);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    exports.distinct = distinct;
    function uniqueFilter(keyFn) {
        const seen = new Set();
        return element => {
            const key = keyFn(element);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        };
    }
    exports.uniqueFilter = uniqueFilter;
    function firstOrDefault(array, notFoundValue) {
        return array.length > 0 ? array[0] : notFoundValue;
    }
    exports.firstOrDefault = firstOrDefault;
    function lastOrDefault(array, notFoundValue) {
        return array.length > 0 ? array[array.length - 1] : notFoundValue;
    }
    exports.lastOrDefault = lastOrDefault;
    function commonPrefixLength(one, other, equals = (a, b) => a === b) {
        let result = 0;
        for (let i = 0, len = Math.min(one.length, other.length); i < len && equals(one[i], other[i]); i++) {
            result++;
        }
        return result;
    }
    exports.commonPrefixLength = commonPrefixLength;
    /**
     * @deprecated Use `[].flat()`
     */
    function flatten(arr) {
        return [].concat(...arr);
    }
    exports.flatten = flatten;
    function range(arg, to) {
        let from = typeof to === 'number' ? arg : 0;
        if (typeof to === 'number') {
            from = arg;
        }
        else {
            from = 0;
            to = arg;
        }
        const result = [];
        if (from <= to) {
            for (let i = from; i < to; i++) {
                result.push(i);
            }
        }
        else {
            for (let i = from; i > to; i--) {
                result.push(i);
            }
        }
        return result;
    }
    exports.range = range;
    function index(array, indexer, mapper) {
        return array.reduce((r, t) => {
            r[indexer(t)] = mapper ? mapper(t) : t;
            return r;
        }, Object.create(null));
    }
    exports.index = index;
    /**
     * Inserts an element into an array. Returns a function which, when
     * called, will remove that element from the array.
     *
     * @deprecated In almost all cases, use a `Set<T>` instead.
     */
    function insert(array, element) {
        array.push(element);
        return () => remove(array, element);
    }
    exports.insert = insert;
    /**
     * Removes an element from an array if it can be found.
     *
     * @deprecated In almost all cases, use a `Set<T>` instead.
     */
    function remove(array, element) {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
            return element;
        }
        return undefined;
    }
    exports.remove = remove;
    /**
     * Insert `insertArr` inside `target` at `insertIndex`.
     * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
     */
    function arrayInsert(target, insertIndex, insertArr) {
        const before = target.slice(0, insertIndex);
        const after = target.slice(insertIndex);
        return before.concat(insertArr, after);
    }
    exports.arrayInsert = arrayInsert;
    /**
     * Uses Fisher-Yates shuffle to shuffle the given array
     */
    function shuffle(array, _seed) {
        let rand;
        if (typeof _seed === 'number') {
            let seed = _seed;
            // Seeded random number generator in JS. Modified from:
            // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
            rand = () => {
                const x = Math.sin(seed++) * 179426549; // throw away most significant digits and reduce any potential bias
                return x - Math.floor(x);
            };
        }
        else {
            rand = Math.random;
        }
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(rand() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    exports.shuffle = shuffle;
    /**
     * Pushes an element to the start of the array, if found.
     */
    function pushToStart(arr, value) {
        const index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
            arr.unshift(value);
        }
    }
    exports.pushToStart = pushToStart;
    /**
     * Pushes an element to the end of the array, if found.
     */
    function pushToEnd(arr, value) {
        const index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
            arr.push(value);
        }
    }
    exports.pushToEnd = pushToEnd;
    function pushMany(arr, items) {
        for (const item of items) {
            arr.push(item);
        }
    }
    exports.pushMany = pushMany;
    function mapArrayOrNot(items, fn) {
        return Array.isArray(items) ?
            items.map(fn) :
            fn(items);
    }
    exports.mapArrayOrNot = mapArrayOrNot;
    function asArray(x) {
        return Array.isArray(x) ? x : [x];
    }
    exports.asArray = asArray;
    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    exports.getRandomElement = getRandomElement;
    /**
     * Insert the new items in the array.
     * @param array The original array.
     * @param start The zero-based location in the array from which to start inserting elements.
     * @param newItems The items to be inserted
     */
    function insertInto(array, start, newItems) {
        const startIdx = getActualStartIndex(array, start);
        const originalLength = array.length;
        const newItemsLength = newItems.length;
        array.length = originalLength + newItemsLength;
        // Move the items after the start index, start from the end so that we don't overwrite any value.
        for (let i = originalLength - 1; i >= startIdx; i--) {
            array[i + newItemsLength] = array[i];
        }
        for (let i = 0; i < newItemsLength; i++) {
            array[i + startIdx] = newItems[i];
        }
    }
    exports.insertInto = insertInto;
    /**
     * Removes elements from an array and inserts new elements in their place, returning the deleted elements. Alternative to the native Array.splice method, it
     * can only support limited number of items due to the maximum call stack size limit.
     * @param array The original array.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns An array containing the elements that were deleted.
     */
    function splice(array, start, deleteCount, newItems) {
        const index = getActualStartIndex(array, start);
        let result = array.splice(index, deleteCount);
        if (result === undefined) {
            // see https://bugs.webkit.org/show_bug.cgi?id=261140
            result = [];
        }
        insertInto(array, index, newItems);
        return result;
    }
    exports.splice = splice;
    /**
     * Determine the actual start index (same logic as the native splice() or slice())
     * If greater than the length of the array, start will be set to the length of the array. In this case, no element will be deleted but the method will behave as an adding function, adding as many element as item[n*] provided.
     * If negative, it will begin that many elements from the end of the array. (In this case, the origin -1, meaning -n is the index of the nth last element, and is therefore equivalent to the index of array.length - n.) If array.length + start is less than 0, it will begin from index 0.
     * @param array The target array.
     * @param start The operation index.
     */
    function getActualStartIndex(array, start) {
        return start < 0 ? Math.max(start + array.length, 0) : Math.min(start, array.length);
    }
    var CompareResult;
    (function (CompareResult) {
        function isLessThan(result) {
            return result < 0;
        }
        CompareResult.isLessThan = isLessThan;
        function isLessThanOrEqual(result) {
            return result <= 0;
        }
        CompareResult.isLessThanOrEqual = isLessThanOrEqual;
        function isGreaterThan(result) {
            return result > 0;
        }
        CompareResult.isGreaterThan = isGreaterThan;
        function isNeitherLessOrGreaterThan(result) {
            return result === 0;
        }
        CompareResult.isNeitherLessOrGreaterThan = isNeitherLessOrGreaterThan;
        CompareResult.greaterThan = 1;
        CompareResult.lessThan = -1;
        CompareResult.neitherLessOrGreaterThan = 0;
    })(CompareResult || (exports.CompareResult = CompareResult = {}));
    function compareBy(selector, comparator) {
        return (a, b) => comparator(selector(a), selector(b));
    }
    exports.compareBy = compareBy;
    function tieBreakComparators(...comparators) {
        return (item1, item2) => {
            for (const comparator of comparators) {
                const result = comparator(item1, item2);
                if (!CompareResult.isNeitherLessOrGreaterThan(result)) {
                    return result;
                }
            }
            return CompareResult.neitherLessOrGreaterThan;
        };
    }
    exports.tieBreakComparators = tieBreakComparators;
    /**
     * The natural order on numbers.
    */
    const numberComparator = (a, b) => a - b;
    exports.numberComparator = numberComparator;
    const booleanComparator = (a, b) => (0, exports.numberComparator)(a ? 1 : 0, b ? 1 : 0);
    exports.booleanComparator = booleanComparator;
    function reverseOrder(comparator) {
        return (a, b) => -comparator(a, b);
    }
    exports.reverseOrder = reverseOrder;
    class ArrayQueue {
        /**
         * Constructs a queue that is backed by the given array. Runtime is O(1).
        */
        constructor(items) {
            this.items = items;
            this.firstIdx = 0;
            this.lastIdx = this.items.length - 1;
        }
        get length() {
            return this.lastIdx - this.firstIdx + 1;
        }
        /**
         * Consumes elements from the beginning of the queue as long as the predicate returns true.
         * If no elements were consumed, `null` is returned. Has a runtime of O(result.length).
        */
        takeWhile(predicate) {
            // P(k) := k <= this.lastIdx && predicate(this.items[k])
            // Find s := min { k | k >= this.firstIdx && !P(k) } and return this.data[this.firstIdx...s)
            let startIdx = this.firstIdx;
            while (startIdx < this.items.length && predicate(this.items[startIdx])) {
                startIdx++;
            }
            const result = startIdx === this.firstIdx ? null : this.items.slice(this.firstIdx, startIdx);
            this.firstIdx = startIdx;
            return result;
        }
        /**
         * Consumes elements from the end of the queue as long as the predicate returns true.
         * If no elements were consumed, `null` is returned.
         * The result has the same order as the underlying array!
        */
        takeFromEndWhile(predicate) {
            // P(k) := this.firstIdx >= k && predicate(this.items[k])
            // Find s := max { k | k <= this.lastIdx && !P(k) } and return this.data(s...this.lastIdx]
            let endIdx = this.lastIdx;
            while (endIdx >= 0 && predicate(this.items[endIdx])) {
                endIdx--;
            }
            const result = endIdx === this.lastIdx ? null : this.items.slice(endIdx + 1, this.lastIdx + 1);
            this.lastIdx = endIdx;
            return result;
        }
        peek() {
            if (this.length === 0) {
                return undefined;
            }
            return this.items[this.firstIdx];
        }
        peekLast() {
            if (this.length === 0) {
                return undefined;
            }
            return this.items[this.lastIdx];
        }
        dequeue() {
            const result = this.items[this.firstIdx];
            this.firstIdx++;
            return result;
        }
        removeLast() {
            const result = this.items[this.lastIdx];
            this.lastIdx--;
            return result;
        }
        takeCount(count) {
            const result = this.items.slice(this.firstIdx, this.firstIdx + count);
            this.firstIdx += count;
            return result;
        }
    }
    exports.ArrayQueue = ArrayQueue;
    /**
     * This class is faster than an iterator and array for lazy computed data.
    */
    class CallbackIterable {
        static { this.empty = new CallbackIterable(_callback => { }); }
        constructor(
        /**
         * Calls the callback for every item.
         * Stops when the callback returns false.
        */
        iterate) {
            this.iterate = iterate;
        }
        forEach(handler) {
            this.iterate(item => { handler(item); return true; });
        }
        toArray() {
            const result = [];
            this.iterate(item => { result.push(item); return true; });
            return result;
        }
        filter(predicate) {
            return new CallbackIterable(cb => this.iterate(item => predicate(item) ? cb(item) : true));
        }
        map(mapFn) {
            return new CallbackIterable(cb => this.iterate(item => cb(mapFn(item))));
        }
        some(predicate) {
            let result = false;
            this.iterate(item => { result = predicate(item); return !result; });
            return result;
        }
        findFirst(predicate) {
            let result;
            this.iterate(item => {
                if (predicate(item)) {
                    result = item;
                    return false;
                }
                return true;
            });
            return result;
        }
        findLast(predicate) {
            let result;
            this.iterate(item => {
                if (predicate(item)) {
                    result = item;
                }
                return true;
            });
            return result;
        }
        findLastMaxBy(comparator) {
            let result;
            let first = true;
            this.iterate(item => {
                if (first || CompareResult.isGreaterThan(comparator(item, result))) {
                    first = false;
                    result = item;
                }
                return true;
            });
            return result;
        }
    }
    exports.CallbackIterable = CallbackIterable;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXlzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9hcnJheXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHOzs7O09BSUc7SUFDSCxTQUFnQixJQUFJLENBQUksS0FBbUIsRUFBRSxJQUFZLENBQUM7UUFDekQsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFGRCxvQkFFQztJQUVELFNBQWdCLEtBQUssQ0FBSSxHQUFRO1FBQ2hDLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQU5ELHNCQU1DO0lBRUQsU0FBZ0IsTUFBTSxDQUFJLEdBQWlDLEVBQUUsS0FBbUMsRUFBRSxhQUFzQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3hKLElBQUksR0FBRyxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQ25CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lB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
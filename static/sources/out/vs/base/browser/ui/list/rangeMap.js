/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/range"], function (require, exports, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RangeMap = exports.consolidate = exports.shift = exports.groupIntersect = void 0;
    /**
     * Returns the intersection between a ranged group and a range.
     * Returns `[]` if the intersection is empty.
     */
    function groupIntersect(range, groups) {
        const result = [];
        for (const r of groups) {
            if (range.start >= r.range.end) {
                continue;
            }
            if (range.end < r.range.start) {
                break;
            }
            const intersection = range_1.Range.intersect(range, r.range);
            if (range_1.Range.isEmpty(intersection)) {
                continue;
            }
            result.push({
                range: intersection,
                size: r.size
            });
        }
        return result;
    }
    exports.groupIntersect = groupIntersect;
    /**
     * Shifts a range by that `much`.
     */
    function shift({ start, end }, much) {
        return { start: start + much, end: end + much };
    }
    exports.shift = shift;
    /**
     * Consolidates a collection of ranged groups.
     *
     * Consolidation is the process of merging consecutive ranged groups
     * that share the same `size`.
     */
    function consolidate(groups) {
        const result = [];
        let previousGroup = null;
        for (const group of groups) {
            const start = group.range.start;
            const end = group.range.end;
            const size = group.size;
            if (previousGroup && size === previousGroup.size) {
                previousGroup.range.end = end;
                continue;
            }
            previousGroup = { range: { start, end }, size };
            result.push(previousGroup);
        }
        return result;
    }
    exports.consolidate = consolidate;
    /**
     * Concatenates several collections of ranged groups into a single
     * collection.
     */
    function concat(...groups) {
        return consolidate(groups.reduce((r, g) => r.concat(g), []));
    }
    class RangeMap {
        get paddingTop() {
            return this._paddingTop;
        }
        set paddingTop(paddingTop) {
            this._size = this._size + paddingTop - this._paddingTop;
            this._paddingTop = paddingTop;
        }
        constructor(topPadding) {
            this.groups = [];
            this._size = 0;
            this._paddingTop = 0;
            this._paddingTop = topPadding ?? 0;
            this._size = this._paddingTop;
        }
        splice(index, deleteCount, items = []) {
            const diff = items.length - deleteCount;
            const before = groupIntersect({ start: 0, end: index }, this.groups);
            const after = groupIntersect({ start: index + deleteCount, end: Number.POSITIVE_INFINITY }, this.groups)
                .map(g => ({ range: shift(g.range, diff), size: g.size }));
            const middle = items.map((item, i) => ({
                range: { start: index + i, end: index + i + 1 },
                size: item.size
            }));
            this.groups = concat(before, middle, after);
            this._size = this._paddingTop + this.groups.reduce((t, g) => t + (g.size * (g.range.end - g.range.start)), 0);
        }
        /**
         * Returns the number of items in the range map.
         */
        get count() {
            const len = this.groups.length;
            if (!len) {
                return 0;
            }
            return this.groups[len - 1].range.end;
        }
        /**
         * Returns the sum of the sizes of all items in the range map.
         */
        get size() {
            return this._size;
        }
        /**
         * Returns the index of the item at the given position.
         */
        indexAt(position) {
            if (position < 0) {
                return -1;
            }
            if (position < this._paddingTop) {
                return 0;
            }
            let index = 0;
            let size = this._paddingTop;
            for (const group of this.groups) {
                const count = group.range.end - group.range.start;
                const newSize = size + (count * group.size);
                if (position < newSize) {
                    return index + Math.floor((position - size) / group.size);
                }
                index += count;
                size = newSize;
            }
            return index;
        }
        /**
         * Returns the index of the item right after the item at the
         * index of the given position.
         */
        indexAfter(position) {
            return Math.min(this.indexAt(position) + 1, this.count);
        }
        /**
         * Returns the start position of the item at the given index.
         */
        positionAt(index) {
            if (index < 0) {
                return -1;
            }
            let position = 0;
            let count = 0;
            for (const group of this.groups) {
                const groupCount = group.range.end - group.range.start;
                const newCount = count + groupCount;
                if (index < newCount) {
                    return this._paddingTop + position + ((index - count) * group.size);
                }
                position += groupCount * group.size;
                count = newCount;
            }
            return -1;
        }
    }
    exports.RangeMap = RangeMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VNYXAuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9saXN0L3JhbmdlTWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRzs7O09BR0c7SUFDSCxTQUFnQixjQUFjLENBQUMsS0FBYSxFQUFFLE1BQXNCO1FBQ25FLE1BQU0sTUFBTSxHQUFtQixFQUFFLENBQUM7UUFFbEMsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUN4QixJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDaEMsU0FBUztZQUNWLENBQUM7WUFFRCxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDL0IsTUFBTTtZQUNQLENBQUM7WUFFRCxNQUFNLFlBQVksR0FBRyxhQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFckQsSUFBSSxhQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7Z0JBQ2pDLFNBQVM7WUFDVixDQUFDO1lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDWCxLQUFLLEVBQUUsWUFBWTtnQkFDbkIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO2FBQ1osQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQXpCRCx3Q0F5QkM7SUFFRDs7T0FFRztJQUNILFNBQWdCLEtBQUssQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQVUsRUFBRSxJQUFZO1FBQ3pELE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxHQUFHLElBQUksRUFBRSxHQUFHLEVBQUUsR0FB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
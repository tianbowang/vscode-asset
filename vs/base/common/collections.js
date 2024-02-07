(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.intersection = exports.diffMaps = exports.diffSets = exports.groupBy = void 0;
    /**
     * Groups the collection into a dictionary based on the provided
     * group function.
     */
    function groupBy(data, groupFn) {
        const result = Object.create(null);
        for (const element of data) {
            const key = groupFn(element);
            let target = result[key];
            if (!target) {
                target = result[key] = [];
            }
            target.push(element);
        }
        return result;
    }
    exports.groupBy = groupBy;
    function diffSets(before, after) {
        const removed = [];
        const added = [];
        for (const element of before) {
            if (!after.has(element)) {
                removed.push(element);
            }
        }
        for (const element of after) {
            if (!before.has(element)) {
                added.push(element);
            }
        }
        return { removed, added };
    }
    exports.diffSets = diffSets;
    function diffMaps(before, after) {
        const removed = [];
        const added = [];
        for (const [index, value] of before) {
            if (!after.has(index)) {
                removed.push(value);
            }
        }
        for (const [index, value] of after) {
            if (!before.has(index)) {
                added.push(value);
            }
        }
        return { removed, added };
    }
    exports.diffMaps = diffMaps;
    /**
     * Computes the intersection of two sets.
     *
     * @param setA - The first set.
     * @param setB - The second iterable.
     * @returns A new set containing the elements that are in both `setA` and `setB`.
     */
    function intersection(setA, setB) {
        const result = new Set();
        for (const elem of setB) {
            if (setA.has(elem)) {
                result.add(elem);
            }
        }
        return result;
    }
    exports.intersection = intersection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2NvbGxlY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRzs7O09BR0c7SUFDSCxTQUFnQixPQUFPLENBQXdDLElBQVMsRUFBRSxPQUEwQjtRQUNuRyxNQUFNLE1BQU0sR0FBbUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxLQUFLLE1BQU0sT0FBTyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQzVCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNiLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzNCLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFYRCwwQkFXQztJQUVELFNBQWdCLFFBQVEsQ0FBSSxNQUFjLEVBQUUsS0FBYTtRQUN4RCxNQUFNLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDeEIsTUFBTSxLQUFLLEdBQVEsRUFBRSxDQUFDO1FBQ3RCLEtBQUssTUFBTSxPQUFPLElBQUksTUFBTSxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QixDQUFDO1FBQ0YsQ0FBQztRQUNELEtBQUssTUFBTSxPQUFPLElBQUksS0FBSyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyQixDQUFDO1FBQ0YsQ0FBQztRQUNELE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQWRELDRCQWNDO0lBRUQsU0FBZ0IsUUFBUSxDQUFPLE1BQWlCLEVBQUUsS0FBZ0I7UUFDakUsTUFBTSxPQUFPLEdBQVEsRUFBRSxDQUFDO1FBQ3hCLE1BQU0sS0FBSyxHQUFRLEVBQUUsQ0FBQztRQUN0QixLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixDQUFDO1FBQ0YsQ0FBQztRQUNELEtBQUssTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN4QixLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLENBQUM7UUFDRixDQUFDO1FBQ0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBZEQsNEJBY0M7SUFFRDs7Ozs7O09BTUc7SUFDSCxTQUFnQixZQUFZLENBQUksSUFBWSxFQUFFLElBQWlCO1FBQzlELE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUFLLENBQUM7UUFDNUIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUN6QixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixDQUFDO1FBQ0YsQ0FBQztRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQVJELG9DQVFDIn0=
//# sourceURL=../../../vs/base/common/collections.js
})
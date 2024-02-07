(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkAdjacentItems = exports.assertFn = exports.softAssert = exports.assert = exports.assertNever = exports.ok = void 0;
    /**
     * Throws an error with the provided message if the provided value does not evaluate to a true Javascript value.
     *
     * @deprecated Use `assert(...)` instead.
     * This method is usually used like this:
     * ```ts
     * import * as assert from 'vs/base/common/assert';
     * assert.ok(...);
     * ```
     *
     * However, `assert` in that example is a user chosen name.
     * There is no tooling for generating such an import statement.
     * Thus, the `assert(...)` function should be used instead.
     */
    function ok(value, message) {
        if (!value) {
            throw new Error(message ? `Assertion failed (${message})` : 'Assertion Failed');
        }
    }
    exports.ok = ok;
    function assertNever(value, message = 'Unreachable') {
        throw new Error(message);
    }
    exports.assertNever = assertNever;
    function assert(condition) {
        if (!condition) {
            throw new errors_1.BugIndicatingError('Assertion Failed');
        }
    }
    exports.assert = assert;
    function softAssert(condition) {
        if (!condition) {
            (0, errors_1.onUnexpectedError)(new errors_1.BugIndicatingError('Assertion Failed'));
        }
    }
    exports.softAssert = softAssert;
    /**
     * condition must be side-effect free!
     */
    function assertFn(condition) {
        if (!condition()) {
            // eslint-disable-next-line no-debugger
            debugger;
            // Reevaluate `condition` again to make debugging easier
            condition();
            (0, errors_1.onUnexpectedError)(new errors_1.BugIndicatingError('Assertion Failed'));
        }
    }
    exports.assertFn = assertFn;
    function checkAdjacentItems(items, predicate) {
        let i = 0;
        while (i < items.length - 1) {
            const a = items[i];
            const b = items[i + 1];
            if (!predicate(a, b)) {
                return false;
            }
            i++;
        }
        return true;
    }
    exports.checkAdjacentItems = checkAdjacentItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9hc3NlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSCxTQUFnQixFQUFFLENBQUMsS0FBZSxFQUFFLE9BQWdCO1FBQ25ELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDakYsQ0FBQztJQUNGLENBQUM7SUFKRCxnQkFJQztJQUVELFNBQWdCLFdBQVcsQ0FBQyxLQUFZLEVBQUUsT0FBTyxHQUFHLGFBQWE7UUFDaEUsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRkQsa0NBRUM7SUFFRCxTQUFnQixNQUFNLENBQUMsU0FBa0I7UUFDeEMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hCLE1BQU0sSUFBSSwyQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xELENBQUM7SUFDRixDQUFDO0lBSkQsd0JBSUM7SUFFRCxTQUFnQixVQUFVLENBQUMsU0FBa0I7UUFDNUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hCLElBQUEsMEJBQWlCLEVBQUMsSUFBSSwyQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFDL0QsQ0FBQztJQUNGLENBQUM7SUFKRCxnQ0FJQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsUUFBUSxDQUFDLFNBQXdCO1FBQ2hELElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1lBQ2xCLHVDQUF1QztZQUN2QyxRQUFRLENBQUM7WUFDVCx3REFBd0Q7WUFDeEQsU0FBUyxFQUFFLENBQUM7WUFDWixJQUFBLDBCQUFpQixFQUFDLElBQUksMkJBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQy9ELENBQUM7SUFDRixDQUFDO0lBUkQsNEJBUUM7SUFFRCxTQUFnQixrQkFBa0IsQ0FBSSxLQUFtQixFQUFFLFNBQTBDO1FBQ3BHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDN0IsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDdEIsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsQ0FBQyxFQUFFLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBWEQsZ0RBV0MifQ==
//# sourceURL=../../../vs/base/common/assert.js
})
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, strings_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lengthMax = exports.lengthHash = exports.lengthOfStringObj = exports.lengthOfString = exports.lengthCompare = exports.lengthOfRange = exports.lengthsToRange = exports.positionToLength = exports.lengthToPosition = exports.lengthGreaterThanEqual = exports.lengthLessThanEqual = exports.lengthLessThan = exports.lengthDiffNonNegative = exports.lengthEquals = exports.sumLengths = exports.lengthAdd = exports.lengthGetColumnCountIfZeroLineCount = exports.lengthGetLineCount = exports.lengthToObj = exports.toLength = exports.lengthIsZero = exports.lengthZero = exports.lengthDiff = exports.LengthObj = void 0;
    /**
     * Represents a non-negative length in terms of line and column count.
     * Prefer using {@link Length} for performance reasons.
    */
    class LengthObj {
        static { this.zero = new LengthObj(0, 0); }
        static lengthDiffNonNegative(start, end) {
            if (end.isLessThan(start)) {
                return LengthObj.zero;
            }
            if (start.lineCount === end.lineCount) {
                return new LengthObj(0, end.columnCount - start.columnCount);
            }
            else {
                return new LengthObj(end.lineCount - start.lineCount, end.columnCount);
            }
        }
        constructor(lineCount, columnCount) {
            this.lineCount = lineCount;
            this.columnCount = columnCount;
        }
        isZero() {
            return this.lineCount === 0 && this.columnCount === 0;
        }
        toLength() {
            return toLength(this.lineCount, this.columnCount);
        }
        isLessThan(other) {
            if (this.lineCount !== other.lineCount) {
                return this.lineCount < other.lineCount;
            }
            return this.columnCount < other.columnCount;
        }
        isGreaterThan(other) {
            if (this.lineCount !== other.lineCount) {
                return this.lineCount > other.lineCount;
            }
            return this.columnCount > other.columnCount;
        }
        equals(other) {
            return this.lineCount === other.lineCount && this.columnCount === other.columnCount;
        }
        compare(other) {
            if (this.lineCount !== other.lineCount) {
                return this.lineCount - other.lineCount;
            }
            return this.columnCount - other.columnCount;
        }
        add(other) {
            if (other.lineCount === 0) {
                return new LengthObj(this.lineCount, this.columnCount + other.columnCount);
            }
            else {
                return new LengthObj(this.lineCount + other.lineCount, other.columnCount);
            }
        }
        toString() {
            return `${this.lineCount},${this.columnCount}`;
        }
    }
    exports.LengthObj = LengthObj;
    /**
     * The end must be greater than or equal to the start.
    */
    function lengthDiff(startLineCount, startColumnCount, endLineCount, endColumnCount) {
        return (startLineCount !== endLineCount)
            ? toLength(endLineCount - startLineCount, endColumnCount)
            : toLength(0, endColumnCount - startColumnCount);
    }
    exports.lengthDiff = lengthDiff;
    exports.lengthZero = 0;
    function lengthIsZero(length) {
        return length === 0;
    }
    exports.lengthIsZero = lengthIsZero;
    /*
     * We have 52 bits available in a JS number.
     * We use the upper 26 bits to store the line and the lower 26 bits to store the column.
     */
    ///*
    const factor = 2 ** 26;
    /*/
    const factor = 1000000;
    // */
    function toLength(lineCount, columnCount) {
        // llllllllllllllllllllllllllcccccccccccccccccccccccccc (52 bits)
        //       line count (26 bits)    column count (26 bits)
        // If there is no overflow (all values/sums below 2^26 = 67108864),
        // we have `toLength(lns1, cols1) + toLength(lns2, cols2) = toLength(lns1 + lns2, cols1 + cols2)`.
        return (lineCount * factor + columnCount);
    }
    exports.toLength = toLength;
    function lengthToObj(length) {
        const l = length;
        const lineCount = Math.floor(l / factor);
        const columnCount = l - lineCount * factor;
        return new LengthObj(lineCount, columnCount);
    }
    exports.lengthToObj = lengthToObj;
    function lengthGetLineCount(length) {
        return Math.floor(length / factor);
    }
    exports.lengthGetLineCount = lengthGetLineCount;
    /**
     * Returns the amount of columns of the given length, assuming that it does not span any line.
    */
    function lengthGetColumnCountIfZeroLineCount(length) {
        return length;
    }
    exports.lengthGetColumnCountIfZeroLineCount = lengthGetColumnCountIfZeroLineCount;
    function lengthAdd(l1, l2) {
        let r = l1 + l2;
        if (l2 >= factor) {
            r = r - (l1 % factor);
        }
        return r;
    }
    exports.lengthAdd = lengthAdd;
    function sumLengths(items, lengthFn) {
        return items.reduce((a, b) => lengthAdd(a, lengthFn(b)), exports.lengthZero);
    }
    exports.sumLengths = sumLengths;
    function lengthEquals(length1, length2) {
        return length1 === length2;
    }
    exports.lengthEquals = lengthEquals;
    /**
     * Returns a non negative length `result` such that `lengthAdd(length1, result) = length2`, or zero if such length does not exist.
     */
    function lengthDiffNonNegative(length1, length2) {
        const l1 = length1;
        const l2 = length2;
        const diff = l2 - l1;
        if (diff <= 0) {
            // line-count of length1 is higher than line-count of length2
            // or they are equal and column-count of length1 is higher than column-count of length2
            return exports.lengthZero;
        }
        const lineCount1 = Math.floor(l1 / factor);
        const lineCount2 = Math.floor(l2 / factor);
        const colCount2 = l2 - lineCount2 * factor;
        if (lineCount1 === lineCount2) {
            const colCount1 = l1 - lineCount1 * factor;
            return toLength(0, colCount2 - colCount1);
        }
        else {
            return toLength(lineCount2 - lineCount1, colCount2);
        }
    }
    exports.lengthDiffNonNegative = lengthDiffNonNegative;
    function lengthLessThan(length1, length2) {
        // First, compare line counts, then column counts.
        return length1 < length2;
    }
    exports.lengthLessThan = lengthLessThan;
    function lengthLessThanEqual(length1, length2) {
        return length1 <= length2;
    }
    exports.lengthLessThanEqual = lengthLessThanEqual;
    function lengthGreaterThanEqual(length1, length2) {
        return length1 >= length2;
    }
    exports.lengthGreaterThanEqual = lengthGreaterThanEqual;
    function lengthToPosition(length) {
        const l = length;
        const lineCount = Math.floor(l / factor);
        const colCount = l - lineCount * factor;
        return new position_1.Position(lineCount + 1, colCount + 1);
    }
    exports.lengthToPosition = lengthToPosition;
    function positionToLength(position) {
        return toLength(position.lineNumber - 1, position.column - 1);
    }
    exports.positionToLength = positionToLength;
    function lengthsToRange(lengthStart, lengthEnd) {
        const l = lengthStart;
        const lineCount = Math.floor(l / factor);
        const colCount = l - lineCount * factor;
        const l2 = lengthEnd;
        const lineCount2 = Math.floor(l2 / factor);
        const colCount2 = l2 - lineCount2 * factor;
        return new range_1.Range(lineCount + 1, colCount + 1, lineCount2 + 1, colCount2 + 1);
    }
    exports.lengthsToRange = lengthsToRange;
    function lengthOfRange(range) {
        if (range.startLineNumber === range.endLineNumber) {
            return new LengthObj(0, range.endColumn - range.startColumn);
        }
        else {
            return new LengthObj(range.endLineNumber - range.startLineNumber, range.endColumn - 1);
        }
    }
    exports.lengthOfRange = lengthOfRange;
    function lengthCompare(length1, length2) {
        const l1 = length1;
        const l2 = length2;
        return l1 - l2;
    }
    exports.lengthCompare = lengthCompare;
    function lengthOfString(str) {
        const lines = (0, strings_1.splitLines)(str);
        return toLength(lines.length - 1, lines[lines.length - 1].length);
    }
    exports.lengthOfString = lengthOfString;
    function lengthOfStringObj(str) {
        const lines = (0, strings_1.splitLines)(str);
        return new LengthObj(lines.length - 1, lines[lines.length - 1].length);
    }
    exports.lengthOfStringObj = lengthOfStringObj;
    /**
     * Computes a numeric hash of the given length.
    */
    function lengthHash(length) {
        return length;
    }
    exports.lengthHash = lengthHash;
    function lengthMax(length1, length2) {
        return length1 > length2 ? length1 : length2;
    }
    exports.lengthMax = lengthMax;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVuZ3RoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL21vZGVsL2JyYWNrZXRQYWlyc1RleHRNb2RlbFBhcnQvYnJhY2tldFBhaXJzVHJlZS9sZW5ndGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHOzs7TUFHRTtJQUNGLE1BQWEsU0FBUztpQkFDUCxTQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWxDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxLQUFnQixFQUFFLEdBQWM7WUFDbkUsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQztZQUN2QixDQUFDO1lBQ0QsSUFBSSxLQUFLLENBQUMsU0FBUyxLQUFLLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDdkMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDOUQsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE9BQU8sSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN4RSxDQUFDO1FBQ0YsQ0FBQztRQUVELFlBQ2lCLFNBQWlCLEVBQ2pCLFdBQW1CO1lBRG5CLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFDakIsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFDaEMsQ0FBQztRQUVFLE1BQU07WUFDWixPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFF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
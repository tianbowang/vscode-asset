/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/editor/common/core/offsetRange", "vs/editor/common/core/range", "vs/base/common/arraysFind"], function (require, exports, errors_1, offsetRange_1, range_1, arraysFind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineRangeSet = exports.LineRange = void 0;
    /**
     * A range of lines (1-based).
     */
    class LineRange {
        static fromRange(range) {
            return new LineRange(range.startLineNumber, range.endLineNumber);
        }
        static fromRangeInclusive(range) {
            return new LineRange(range.startLineNumber, range.endLineNumber + 1);
        }
        static subtract(a, b) {
            if (!b) {
                return [a];
            }
            if (a.startLineNumber < b.startLineNumber && b.endLineNumberExclusive < a.endLineNumberExclusive) {
                return [
                    new LineRange(a.startLineNumber, b.startLineNumber),
                    new LineRange(b.endLineNumberExclusive, a.endLineNumberExclusive)
                ];
            }
            else if (b.startLineNumber <= a.startLineNumber && a.endLineNumberExclusive <= b.endLineNumberExclusive) {
                return [];
            }
            else if (b.endLineNumberExclusive < a.endLineNumberExclusive) {
                return [new LineRange(Math.max(b.endLineNumberExclusive, a.startLineNumber), a.endLineNumberExclusive)];
            }
            else {
                return [new LineRange(a.startLineNumber, Math.min(b.startLineNumber, a.endLineNumberExclusive))];
            }
        }
        /**
         * @param lineRanges An array of sorted line ranges.
         */
        static joinMany(lineRanges) {
            if (lineRanges.length === 0) {
                return [];
            }
            let result = new LineRangeSet(lineRanges[0].slice());
            for (let i = 1; i < lineRanges.length; i++) {
                result = result.getUnion(new LineRangeSet(lineRanges[i].slice()));
            }
            return result.ranges;
        }
        static ofLength(startLineNumber, length) {
            return new LineRange(startLineNumber, startLineNumber + length);
        }
        /**
         * @internal
         */
        static deserialize(lineRange) {
            return new LineRange(lineRange[0], lineRange[1]);
        }
        constructor(startLineNumber, endLineNumberExclusive) {
            if (startLineNumber > endLineNumberExclusive) {
                throw new errors_1.BugIndicatingError(`startLineNumber ${startLineNumber} cannot be after endLineNumberExclusive ${endLineNumberExclusive}`);
            }
            this.startLineNumber = startLineNumber;
            this.endLineNumberExclusive = endLineNumberExclusive;
        }
        /**
         * Indicates if this line range contains the given line number.
         */
        contains(lineNumber) {
            return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
        }
        /**
         * Indicates if this line range is empty.
         */
        get isEmpty() {
            return this.startLineNumber === this.endLineNumberExclusive;
        }
        /**
         * Moves this line range by the given offset of line numbers.
         */
        delta(offset) {
            return new LineRange(this.startLineNumber + offset, this.endLineNumberExclusive + offset);
        }
        deltaLength(offset) {
            return new LineRange(this.startLineNumber, this.endLineNumberExclusive + offset);
        }
        /**
         * The number of lines this line range spans.
         */
        get length() {
            return this.endLineNumberExclusive - this.startLineNumber;
        }
        /**
         * Creates a line range that combines this and the given line range.
         */
        join(other) {
            return new LineRange(Math.min(this.startLineNumber, other.startLineNumber), Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive));
        }
        toString() {
            return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
        }
        /**
         * The resulting range is empty if the ranges do not intersect, but touch.
         * If the ranges don't even touch, the result is undefined.
         */
        intersect(other) {
            const startLineNumber = Math.max(this.startLineNumber, other.startLineNumber);
            const endLineNumberExclusive = Math.min(this.endLineNumberExclusive, other.endLineNumberExclusive);
            if (startLineNumber <= endLineNumberExclusive) {
                return new LineRange(startLineNumber, endLineNumberExclusive);
            }
            return undefined;
        }
        intersectsStrict(other) {
            return this.startLineNumber < other.endLineNumberExclusive && other.startLineNumber < this.endLineNumberExclusive;
        }
        overlapOrTouch(other) {
            return this.startLineNumber <= other.endLineNumberExclusive && other.startLineNumber <= this.endLineNumberExclusive;
        }
        equals(b) {
            return this.startLineNumber === b.startLineNumber && this.endLineNumberExclusive === b.endLineNumberExclusive;
        }
        toInclusiveRange() {
            if (this.isEmpty) {
                return null;
            }
            return new range_1.Range(this.startLineNumber, 1, this.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER);
        }
        toExclusiveRange() {
            return new range_1.Range(this.startLineNumber, 1, this.endLineNumberExclusive, 1);
        }
        mapToLineArray(f) {
            const result = [];
            for (let lineNumber = this.startLineNumber; lineNumber < this.endLineNumberExclusive; lineNumber++) {
                result.push(f(lineNumber));
            }
            return result;
        }
        forEach(f) {
            for (let lineNumber = this.startLineNumber; lineNumber < this.endLineNumberExclusive; lineNumber++) {
                f(lineNumber);
            }
        }
        /**
         * @internal
         */
        serialize() {
            return [this.startLineNumber, this.endLineNumberExclusive];
        }
        includes(lineNumber) {
            return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
        }
        /**
         * Converts this 1-based line range to a 0-based offset range (subtracts 1!).
         * @internal
         */
        toOffsetRange() {
            return new offsetRange_1.OffsetRange(this.startLineNumber - 1, this.endLineNumberExclusive - 1);
        }
    }
    exports.LineRange = LineRange;
    class LineRangeSet {
        constructor(
        /**
         * Sorted by start line number.
         * No two line ranges are touching or intersecting.
         */
        _normalizedRanges = []) {
            this._normalizedRanges = _normalizedRanges;
        }
        get ranges() {
            return this._normalizedRanges;
        }
        addRange(range) {
            if (range.length === 0) {
                return;
            }
            // Idea: Find joinRange such that:
            // replaceRange = _normalizedRanges.replaceRange(joinRange, range.joinAll(joinRange.map(idx => this._normalizedRanges[idx])))
            // idx of first element that touches range or that is after range
            const joinRangeStartIdx = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(this._normalizedRanges, r => r.endLineNumberExclusive >= range.startLineNumber);
            // idx of element after { last element that touches range or that is before range }
            const joinRangeEndIdxExclusive = (0, arraysFind_1.findLastIdxMonotonous)(this._normalizedRanges, r => r.startLineNumber <= range.endLineNumberExclusive) + 1;
            if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
                // If there is no element that touches range, then joinRangeStartIdx === joinRangeEndIdxExclusive and that value is the index of the element after range
                this._normalizedRanges.splice(joinRangeStartIdx, 0, range);
            }
            else if (joinRangeStartIdx === joinRangeEndIdxExclusive - 1) {
                // Else, there is an element that touches range and in this case it is both the first and last element. Thus we can replace it
                const joinRange = this._normalizedRanges[joinRangeStartIdx];
                this._normalizedRanges[joinRangeStartIdx] = joinRange.join(range);
            }
            else {
                // First and last element are different - we need to replace the entire range
                const joinRange = this._normalizedRanges[joinRangeStartIdx].join(this._normalizedRanges[joinRangeEndIdxExclusive - 1]).join(range);
                this._normalizedRanges.splice(joinRangeStartIdx, joinRangeEndIdxExclusive - joinRangeStartIdx, joinRange);
            }
        }
        contains(lineNumber) {
            const rangeThatStartsBeforeEnd = (0, arraysFind_1.findLastMonotonous)(this._normalizedRanges, r => r.startLineNumber <= lineNumber);
            return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > lineNumber;
        }
        intersects(range) {
            const rangeThatStartsBeforeEnd = (0, arraysFind_1.findLastMonotonous)(this._normalizedRanges, r => r.startLineNumber < range.endLineNumberExclusive);
            return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > range.startLineNumber;
        }
        getUnion(other) {
            if (this._normalizedRanges.length === 0) {
                return other;
            }
            if (other._normalizedRanges.length === 0) {
                return this;
            }
            const result = [];
            let i1 = 0;
            let i2 = 0;
            let current = null;
            while (i1 < this._normalizedRanges.length || i2 < other._normalizedRanges.length) {
                let next = null;
                if (i1 < this._normalizedRanges.length && i2 < other._normalizedRanges.length) {
                    const lineRange1 = this._normalizedRanges[i1];
                    const lineRange2 = other._normalizedRanges[i2];
                    if (lineRange1.startLineNumber < lineRange2.startLineNumber) {
                        next = lineRange1;
                        i1++;
                    }
                    else {
                        next = lineRange2;
                        i2++;
                    }
                }
                else if (i1 < this._normalizedRanges.length) {
                    next = this._normalizedRanges[i1];
                    i1++;
                }
                else {
                    next = other._normalizedRanges[i2];
                    i2++;
                }
                if (current === null) {
                    current = next;
                }
                else {
                    if (current.endLineNumberExclusive >= next.startLineNumber) {
                        // merge
                        current = new LineRange(current.startLineNumber, Math.max(current.endLineNumberExclusive, next.endLineNumberExclusive));
                    }
                    else {
                        // push
                        result.push(current);
                        current = next;
                    }
                }
            }
            if (current !== null) {
                result.push(current);
            }
            return new LineRangeSet(result);
        }
        /**
         * Subtracts all ranges in this set from `range` and returns the result.
         */
        subtractFrom(range) {
            // idx of first element that touches range or that is after range
            const joinRangeStartIdx = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(this._normalizedRanges, r => r.endLineNumberExclusive >= range.startLineNumber);
            // idx of element after { last element that touches range or that is before range }
            const joinRangeEndIdxExclusive = (0, arraysFind_1.findLastIdxMonotonous)(this._normalizedRanges, r => r.startLineNumber <= range.endLineNumberExclusive) + 1;
            if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
                return new LineRangeSet([range]);
            }
            const result = [];
            let startLineNumber = range.startLineNumber;
            for (let i = joinRangeStartIdx; i < joinRangeEndIdxExclusive; i++) {
                const r = this._normalizedRanges[i];
                if (r.startLineNumber > startLineNumber) {
                    result.push(new LineRange(startLineNumber, r.startLineNumber));
                }
                startLineNumber = r.endLineNumberExclusive;
            }
            if (startLineNumber < range.endLineNumberExclusive) {
                result.push(new LineRange(startLineNumber, range.endLineNumberExclusive));
            }
            return new LineRangeSet(result);
        }
        toString() {
            return this._normalizedRanges.map(r => r.toString()).join(', ');
        }
        getIntersection(other) {
            const result = [];
            let i1 = 0;
            let i2 = 0;
            while (i1 < this._normalizedRanges.length && i2 < other._normalizedRanges.length) {
                const r1 = this._normalizedRanges[i1];
                const r2 = other._normalizedRanges[i2];
                const i = r1.intersect(r2);
                if (i && !i.isEmpty) {
                    result.push(i);
                }
                if (r1.endLineNumberExclusive < r2.endLineNumberExclusive) {
                    i1++;
                }
                else {
                    i2++;
                }
            }
            return new LineRangeSet(result);
        }
        getWithDelta(value) {
            return new LineRangeSet(this._normalizedRanges.map(r => r.delta(value)));
        }
    }
    exports.LineRangeSet = LineRangeSet;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZVJhbmdlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2NvcmUvbGluZVJhbmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRzs7T0FFRztJQUNILE1BQWEsU0FBUztRQUNkLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBWTtZQUNuQyxPQUFPLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsS0FBWTtZQUM1QyxPQUFPLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFZLEVBQUUsQ0FBd0I7WUFDNUQsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNSLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNaLENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLGVBQWUsSUFBSSxDQUFDLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLHNCQUFzQixFQUFFLENBQUM7Z0JBQ2xHLE9BQU87b0JBQ04sSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDO29CQUNuRCxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQixDQUFDO2lCQUNqRSxDQUFDO1lBQ0gsQ0FBQztpQkFBTSxJQUFJLENBQUMsQ0FBQyxlQUFlLElBQUksQ0FBQyxDQUFDLGVBQWUsSUFBSSxDQUFDLENBQUMsc0JBQXNCLElBQUksQ0FBQyxDQUFD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
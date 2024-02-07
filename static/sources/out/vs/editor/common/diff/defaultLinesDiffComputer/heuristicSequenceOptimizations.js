/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/offsetRange", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm"], function (require, exports, arrays_1, offsetRange_1, diffAlgorithm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removeVeryShortMatchingTextBetweenLongDiffs = exports.removeVeryShortMatchingLinesBetweenDiffs = exports.extendDiffsToEntireWordIfAppropriate = exports.removeShortMatches = exports.optimizeSequenceDiffs = void 0;
    function optimizeSequenceDiffs(sequence1, sequence2, sequenceDiffs) {
        let result = sequenceDiffs;
        result = joinSequenceDiffsByShifting(sequence1, sequence2, result);
        // Sometimes, calling this function twice improves the result.
        // Uncomment the second invocation and run the tests to see the difference.
        result = joinSequenceDiffsByShifting(sequence1, sequence2, result);
        result = shiftSequenceDiffs(sequence1, sequence2, result);
        return result;
    }
    exports.optimizeSequenceDiffs = optimizeSequenceDiffs;
    /**
     * This function fixes issues like this:
     * ```
     * import { Baz, Bar } from "foo";
     * ```
     * <->
     * ```
     * import { Baz, Bar, Foo } from "foo";
     * ```
     * Computed diff: [ {Add "," after Bar}, {Add "Foo " after space} }
     * Improved diff: [{Add ", Foo" after Bar}]
     */
    function joinSequenceDiffsByShifting(sequence1, sequence2, sequenceDiffs) {
        if (sequenceDiffs.length === 0) {
            return sequenceDiffs;
        }
        const result = [];
        result.push(sequenceDiffs[0]);
        // First move them all to the left as much as possible and join them if possible
        for (let i = 1; i < sequenceDiffs.length; i++) {
            const prevResult = result[result.length - 1];
            let cur = sequenceDiffs[i];
            if (cur.seq1Range.isEmpty || cur.seq2Range.isEmpty) {
                const length = cur.seq1Range.start - prevResult.seq1Range.endExclusive;
                let d;
                for (d = 1; d <= length; d++) {
                    if (sequence1.getElement(cur.seq1Range.start - d) !== sequence1.getElement(cur.seq1Range.endExclusive - d) ||
                        sequence2.getElement(cur.seq2Range.start - d) !== sequence2.getElement(cur.seq2Range.endExclusive - d)) {
                        break;
                    }
                }
                d--;
                if (d === length) {
                    // Merge previous and current diff
                    result[result.length - 1] = new diffAlgorithm_1.SequenceDiff(new offsetRange_1.OffsetRange(prevResult.seq1Range.start, cur.seq1Range.endExclusive - length), new offsetRange_1.OffsetRange(prevResult.seq2Range.start, cur.seq2Range.endExclusive - length));
                    continue;
                }
                cur = cur.delta(-d);
            }
            result.push(cur);
        }
        const result2 = [];
        // Then move them all to the right and join them again if possible
        for (let i = 0; i < result.length - 1; i++) {
            const nextResult = result[i + 1];
            let cur = result[i];
            if (cur.seq1Range.isEmpty || cur.seq2Range.isEmpty) {
                const length = nextResult.seq1Range.start - cur.seq1Range.endExclusive;
                let d;
                for (d = 0; d < length; d++) {
                    if (!sequence1.isStronglyEqual(cur.seq1Range.start + d, cur.seq1Range.endExclusive + d) ||
                        !sequence2.isStronglyEqual(cur.seq2Range.start + d, cur.seq2Range.endExclusive + d)) {
                        break;
                    }
                }
                if (d === length) {
                    // Merge previous and current diff, write to result!
                    result[i + 1] = new diffAlgorithm_1.SequenceDiff(new offsetRange_1.OffsetRange(cur.seq1Range.start + length, nextResult.seq1Range.endExclusive), new offsetRange_1.OffsetRange(cur.seq2Range.start + length, nextResult.seq2Range.endExclusive));
                    continue;
                }
                if (d > 0) {
                    cur = cur.delta(d);
                }
            }
            result2.push(cur);
        }
        if (result.length > 0) {
            result2.push(result[result.length - 1]);
        }
        return result2;
    }
    // align character level diffs at whitespace characters
    // import { IBar } from "foo";
    // import { I[Arr, I]Bar } from "foo";
    // ->
    // import { [IArr, ]IBar } from "foo";
    // import { ITransaction, observableValue, transaction } from 'vs/base/common/observable';
    // import { ITransaction, observable[FromEvent, observable]Value, transaction } from 'vs/base/common/observable';
    // ->
    // import { ITransaction, [observableFromEvent, ]observableValue, transaction } from 'vs/base/common/observable';
    // collectBrackets(level + 1, levelPerBracketType);
    // collectBrackets(level + 1, levelPerBracket[ + 1, levelPerBracket]Type);
    // ->
    // collectBrackets(level + 1, [levelPerBracket + 1, ]levelPerBracketType);
    function shiftSequenceDiffs(sequence1, sequence2, sequenceDiffs) {
        if (!sequence1.getBoundaryScore || !sequence2.getBoundaryScore) {
            return sequenceDiffs;
        }
        for (let i = 0; i < sequenceDiffs.length; i++) {
            const prevDiff = (i > 0 ? sequenceDiffs[i - 1] : undefined);
            const diff = sequenceDiffs[i];
            const nextDiff = (i + 1 < sequenceDiffs.length ? sequenceDiffs[i + 1] : undefined);
            const seq1ValidRange = new offsetRange_1.OffsetRange(prevDiff ? prevDiff.seq1Range.endExclusive + 1 : 0, nextDiff ? nextDiff.seq1Range.start - 1 : sequence1.length);
            const seq2ValidRange = new offsetRange_1.OffsetRange(prevDiff ? prevDiff.seq2Range.endExclusive + 1 : 0, nextDiff ? nextDiff.seq2Range.start - 1 : sequence2.length);
            if (diff.seq1Range.isEmpty) {
                sequenceDiffs[i] = shiftDiffToBetterPosition(diff, sequence1, sequence2, seq1ValidRange, seq2ValidRange);
            }
            else if (diff.seq2Range.isEmpty) {
                sequenceDiffs[i] = shiftDiffToBetterPosition(diff.swap(), sequence2, sequence1, seq2ValidRange, seq1ValidRange).swap();
            }
        }
        return sequenceDiffs;
    }
    function shiftDiffToBetterPosition(diff, sequence1, sequence2, seq1ValidRange, seq2ValidRange) {
        const maxShiftLimit = 100; // To prevent performance issues
        // don't touch previous or next!
        let deltaBefore = 1;
        while (diff.seq1Range.start - deltaBefore >= seq1ValidRange.start &&
            diff.seq2Range.start - deltaBefore >= seq2ValidRange.start &&
            sequence2.isStronglyEqual(diff.seq2Range.start - deltaBefore, diff.seq2Range.endExclusive - deltaBefore) && deltaBefore < maxShiftLimit) {
            deltaBefore++;
        }
        deltaBefore--;
        let deltaAfter = 0;
        while (diff.seq1Range.start + deltaAfter < seq1ValidRange.endExclusive &&
            diff.seq2Range.endExclusive + deltaAfter < seq2ValidRange.endExclusive &&
            sequence2.isStronglyEqual(diff.seq2Range.start + deltaAfter, diff.seq2Range.endExclusive + deltaAfter) && deltaAfter < maxShiftLimit) {
            deltaAfter++;
        }
        if (deltaBefore === 0 && deltaAfter === 0) {
            return diff;
        }
        // Visualize `[sequence1.text, diff.seq1Range.start + deltaAfter]`
        // and `[sequence2.text, diff.seq2Range.start + deltaAfter, diff.seq2Range.endExclusive + deltaAfter]`
        let bestDelta = 0;
        let bestScore = -1;
        // find best scored delta
        for (let delta = -deltaBefore; delta <= deltaAfter; delta++) {
            const seq2OffsetStart = diff.seq2Range.start + delta;
            const seq2OffsetEndExclusive = diff.seq2Range.endExclusive + delta;
            const seq1Offset = diff.seq1Range.start + delta;
            const score = sequence1.getBoundaryScore(seq1Offset) + sequence2.getBoundaryScore(seq2OffsetStart) + sequence2.getBoundaryScore(seq2OffsetEndExclusive);
            if (score > bestScore) {
                bestScore = score;
                bestDelta = delta;
            }
        }
        return diff.delta(bestDelta);
    }
    function removeShortMatches(sequence1, sequence2, sequenceDiffs) {
        const result = [];
        for (const s of sequenceDiffs) {
            const last = result[result.length - 1];
            if (!last) {
                result.push(s);
                continue;
            }
            if (s.seq1Range.start - last.seq1Range.endExclusive <= 2 || s.seq2Range.start - last.seq2Range.endExclusive <= 2) {
                result[result.length - 1] = new diffAlgorithm_1.SequenceDiff(last.seq1Range.join(s.seq1Range), last.seq2Range.join(s.seq2Range));
            }
            else {
                result.push(s);
            }
        }
        return result;
    }
    exports.removeShortMatches = removeShortMatches;
    function extendDiffsToEntireWordIfAppropriate(sequence1, sequence2, sequenceDiffs) {
        const equalMappings = diffAlgorithm_1.SequenceDiff.invert(sequenceDiffs, sequence1.length);
        const additional = [];
        let lastPoint = new diffAlgorithm_1.OffsetPair(0, 0);
        function scanWord(pair, equalMapping) {
            if (pair.offset1 < lastPoint.offset1 || pair.offset2 < lastPoint.offset2) {
                return;
            }
            const w1 = sequence1.findWordContaining(pair.offset1);
            const w2 = sequence2.findWordContaining(pair.offset2);
            if (!w1 || !w2) {
                return;
            }
            let w = new diffAlgorithm_1.SequenceDiff(w1, w2);
            const equalPart = w.intersect(equalMapping);
            let equalChars1 = equalPart.seq1Range.length;
            let equalChars2 = equalPart.seq2Range.length;
            // The words do not touch previous equals mappings, as we would have processed them already.
            // But they might touch the next ones.
            while (equalMappings.length > 0) {
                const next = equalMappings[0];
                const intersects = next.seq1Range.intersects(w1) || next.seq2Range.intersects(w2);
                if (!intersects) {
                    break;
                }
                const v1 = sequence1.findWordContaining(next.seq1Range.start);
                const v2 = sequence2.findWordContaining(next.seq2Range.start);
                // Because there is an intersection, we know that the words are not empty.
                const v = new diffAlgorithm_1.SequenceDiff(v1, v2);
                const equalPart = v.intersect(next);
                equalChars1 += equalPart.seq1Range.length;
                equalChars2 += equalPart.seq2Range.length;
                w = w.join(v);
                if (w.seq1Range.endExclusive >= next.seq1Range.endExclusive) {
                    // The word extends beyond the next equal mapping.
                    equalMappings.shift();
                }
                else {
                    break;
                }
            }
            if (equalChars1 + equalChars2 < (w.seq1Range.length + w.seq2Range.length) * 2 / 3) {
                additional.push(w);
            }
            lastPoint = w.getEndExclusives();
        }
        while (equalMappings.length > 0) {
            const next = equalMappings.shift();
            if (next.seq1Range.isEmpty) {
                continue;
            }
            scanWord(next.getStarts(), next);
            // The equal parts are not empty, so -1 gives us a character that is equal in both parts.
            scanWord(next.getEndExclusives().delta(-1), next);
        }
        const merged = mergeSequenceDiffs(sequenceDiffs, additional);
        return merged;
    }
    exports.extendDiffsToEntireWordIfAppropriate = extendDiffsToEntireWordIfAppropriate;
    function mergeSequenceDiffs(sequenceDiffs1, sequenceDiffs2) {
        const result = [];
        while (sequenceDiffs1.length > 0 || sequenceDiffs2.length > 0) {
            const sd1 = sequenceDiffs1[0];
            const sd2 = sequenceDiffs2[0];
            let next;
            if (sd1 && (!sd2 || sd1.seq1Range.start < sd2.seq1Range.start)) {
                next = sequenceDiffs1.shift();
            }
            else {
                next = sequenceDiffs2.shift();
            }
            if (result.length > 0 && result[result.length - 1].seq1Range.endExclusive >= next.seq1Range.start) {
                result[result.length - 1] = result[result.length - 1].join(next);
            }
            else {
                result.push(next);
            }
        }
        return result;
    }
    function removeVeryShortMatchingLinesBetweenDiffs(sequence1, _sequence2, sequenceDiffs) {
        let diffs = sequenceDiffs;
        if (diffs.length === 0) {
            return diffs;
        }
        let counter = 0;
        let shouldRepeat;
        do {
            shouldRepeat = false;
            const result = [
                diffs[0]
            ];
            for (let i = 1; i < diffs.length; i++) {
                const cur = diffs[i];
                const lastResult = result[result.length - 1];
                function shouldJoinDiffs(before, after) {
                    const unchangedRange = new offsetRange_1.OffsetRange(lastResult.seq1Range.endExclusive, cur.seq1Range.start);
                    const unchangedText = sequence1.getText(unchangedRange);
                    const unchangedTextWithoutWs = unchangedText.replace(/\s/g, '');
                    if (unchangedTextWithoutWs.length <= 4
                        && (before.seq1Range.length + before.seq2Range.length > 5 || after.seq1Range.length + after.seq2Range.length > 5)) {
                        return true;
                    }
                    return false;
                }
                const shouldJoin = shouldJoinDiffs(lastResult, cur);
                if (shouldJoin) {
                    shouldRepeat = true;
                    result[result.length - 1] = result[result.length - 1].join(cur);
                }
                else {
                    result.push(cur);
                }
            }
            diffs = result;
        } while (counter++ < 10 && shouldRepeat);
        return diffs;
    }
    exports.removeVeryShortMatchingLinesBetweenDiffs = removeVeryShortMatchingLinesBetweenDiffs;
    function removeVeryShortMatchingTextBetweenLongDiffs(sequence1, sequence2, sequenceDiffs) {
        let diffs = sequenceDiffs;
        if (diffs.length === 0) {
            return diffs;
        }
        let counter = 0;
        let shouldRepeat;
        do {
            shouldRepeat = false;
            const result = [
                diffs[0]
            ];
            for (let i = 1; i < diffs.length; i++) {
                const cur = diffs[i];
                const lastResult = result[result.length - 1];
                function shouldJoinDiffs(before, after) {
                    const unchangedRange = new offsetRange_1.OffsetRange(lastResult.seq1Range.endExclusive, cur.seq1Range.start);
                    const unchangedLineCount = sequence1.countLinesIn(unchangedRange);
                    if (unchangedLineCount > 5 || unchangedRange.length > 500) {
                        return false;
                    }
                    const unchangedText = sequence1.getText(unchangedRange).trim();
                    if (unchangedText.length > 20 || unchangedText.split(/\r\n|\r|\n/).length > 1) {
                        return false;
                    }
                    const beforeLineCount1 = sequence1.countLinesIn(before.seq1Range);
                    const beforeSeq1Length = before.seq1Range.length;
                    const beforeLineCount2 = sequence2.countLinesIn(before.seq2Range);
                    const beforeSeq2Length = before.seq2Range.length;
                    const afterLineCount1 = sequence1.countLinesIn(after.seq1Range);
                    const afterSeq1Length = after.seq1Range.length;
                    const afterLineCount2 = sequence2.countLinesIn(after.seq2Range);
                    const afterSeq2Length = after.seq2Range.length;
                    // TODO: Maybe a neural net can be used to derive the result from these numbers
                    const max = 2 * 40 + 50;
                    function cap(v) {
                        return Math.min(v, max);
                    }
                    if (Math.pow(Math.pow(cap(beforeLineCount1 * 40 + beforeSeq1Length), 1.5) + Math.pow(cap(beforeLineCount2 * 40 + beforeSeq2Length), 1.5), 1.5)
                        + Math.pow(Math.pow(cap(afterLineCount1 * 40 + afterSeq1Length), 1.5) + Math.pow(cap(afterLineCount2 * 40 + afterSeq2Length), 1.5), 1.5) > ((max ** 1.5) ** 1.5) * 1.3) {
                        return true;
                    }
                    return false;
                }
                const shouldJoin = shouldJoinDiffs(lastResult, cur);
                if (shouldJoin) {
                    shouldRepeat = true;
                    result[result.length - 1] = result[result.length - 1].join(cur);
                }
                else {
                    result.push(cur);
                }
            }
            diffs = result;
        } while (counter++ < 10 && shouldRepeat);
        const newDiffs = [];
        // Remove short suffixes/prefixes
        (0, arrays_1.forEachWithNeighbors)(diffs, (prev, cur, next) => {
            let newDiff = cur;
            function shouldMarkAsChanged(text) {
                return text.length > 0 && text.trim().length <= 3 && cur.seq1Range.length + cur.seq2Range.length > 100;
            }
            const fullRange1 = sequence1.extendToFullLines(cur.seq1Range);
            const prefix = sequence1.getText(new offsetRange_1.OffsetRange(fullRange1.start, cur.seq1Range.start));
            if (shouldMarkAsChanged(prefix)) {
                newDiff = newDiff.deltaStart(-prefix.length);
            }
            const suffix = sequence1.getText(new offsetRange_1.OffsetRange(cur.seq1Range.endExclusive, fullRange1.endExclusive));
            if (shouldMarkAsChanged(suffix)) {
                newDiff = newDiff.deltaEnd(suffix.length);
            }
            const availableSpace = diffAlgorithm_1.SequenceDiff.fromOffsetPairs(prev ? prev.getEndExclusives() : diffAlgorithm_1.OffsetPair.zero, next ? next.getStarts() : diffAlgorithm_1.OffsetPair.max);
            const result = newDiff.intersect(availableSpace);
            if (newDiffs.length > 0 && result.getStarts().equals(newDiffs[newDiffs.length - 1].getEndExclusives())) {
                newDiffs[newDiffs.length - 1] = newDiffs[newDiffs.length - 1].join(result);
            }
            else {
                newDiffs.push(result);
            }
        });
        return newDiffs;
    }
    exports.removeVeryShortMatchingTextBetweenLongDiffs = removeVeryShortMatchingTextBetweenLongDiffs;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGV1cmlzdGljU2VxdWVuY2VPcHRpbWl6YXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2RpZmYvZGVmYXVsdExpbmVzRGlmZkNvbXB1dGVyL2hldXJpc3RpY1NlcXVlbmNlT3B0aW1pemF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsU0FBZ0IscUJBQXFCLENBQUMsU0FBb0IsRUFBRSxTQUFvQixFQUFFLGFBQTZCO1FBQzlHLElBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQztRQUMzQixNQUFNLEdBQUcsMkJBQTJCLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNuRSw4REFBOEQ7UUFDOUQsMkVBQTJFO1FBQzNFLE1BQU0sR0FBRywyQkFBMkIsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25FLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQVJELHNEQVFDO0lBRUQ7Ozs7Ozs7Ozs7O09BV0c7SUFDSCxTQUFTLDJCQUEyQixDQUFDLFNBQW9CLEVBQUUsU0FBb0IsRUFBRSxhQUE2QjtRQUM3RyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDaEMsT0FBTyxhQUFhLENBQUM7UUFDdEIsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFtQixFQUFFLENBQUM7UUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5QixnRkFBZ0Y7UUFDaEYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMvQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLEdBQUcsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFM0IsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNwRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztnQkFDdkUsSUFBSSxDQUFDLENBQUM7Z0JBQ04sS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDOUIsSUFDQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO3dCQUN0RyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDekcsTUFBTTtvQkFDUCxDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsQ0FBQyxFQUFFLENBQUM7Z0JBRUosSUFBSSxDQUFDLEtBQUssTUFBTSxFQUFFLENBQUM7b0JBQ2xCLGtDQUFrQztvQkFDbEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSw0QkFBWSxDQUMzQyxJQUFJLHlCQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLEVBQ2hGLElBQUkseUJBQVcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsQ0FDaEYsQ0FBQztvQkFDRixTQUFTO2dCQUNWLENBQUM7Z0JBRUQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixDQUFDO1lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQixDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQW1CLEVBQUUsQ0FBQztRQUNuQyxrRUFBa0U7UUFDbEUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDNUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqQyxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFcEIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNwRCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztnQkFDdkUsSUFBSSxDQUFDLENBQUM7Z0JBQ04sS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDN0IsSUFDQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQzt3QkFDbkYsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsRUFDbEYsQ0FBQzt3QkFDRixNQUFNO29CQUNQLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxJQUFJLENBQUMsS0FBSyxNQUFNLEVBQUUsQ0FBQztvQkFDbEIsb0RBQW9EO29CQUNwRCxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksNEJBQVksQ0FDL0IsSUFBSSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLE1BQU0sRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUNoRixJQUFJLHlCQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxFQUFFLFVBQVUsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQ2hGLENBQUM7b0JBQ0YsU0FBUztnQkFDVixDQUFDO2dCQUVELElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNYLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixDQUFDO1lBQ0YsQ0FBQztZQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsQ0FBQztRQUVELElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFRCx1REFBdUQ7SUFDdkQsOEJBQThCO0lBQzlCLHNDQUFzQztJQUN0QyxLQUFLO0lBQ0wsc0NBQXNDO0lBRXRDLDBGQUEwRjtJQUMxRixpSEFBaUg7SUFDakgsS0FBSztJQUNMLGlIQUFpSDtJQUVqSCxtREFBbUQ7SUFDbkQsMEVBQTBFO0lBQzFFLEtBQUs7SUFDTCwwRUFBMEU7SUFFMUUsU0FBUyxrQkFBa0IsQ0FBQyxTQUFvQixFQUFFLFNBQW9CLEVBQUUsYUFBNkI7UUFDcEcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2hFLE9BQU8sYUFBYSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQy9DLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUQsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVuRixNQUFNLGNBQWMsR0FBRyxJQUFJLHlCQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZKLE1BQU0sY0FBYyxHQUFHLElBQUkseUJBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdkosSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM1QixhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcseUJBQXlCLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzFHLENBQUM7aUJBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNuQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3hILENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxhQUFhLENBQUM7SUFDdEIsQ0FBQztJQUVELFNBQVMseUJBQXlCLENBQUMsSUFBa0IsRUFBRSxTQUFvQixFQUFFLFNBQW9CLEVBQUUsY0FBMkIsRUFBRSxjQUEyQjtRQUMxSixNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsQ0FBQyxnQ0FBZ0M7UUFFM0QsZ0NBQWdDO1FBQ2hDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNwQixPQUNDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFdBQVcsSUFBSSxjQUFjLENBQUMsS0FBSztZQUMxRCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxXQUFXLElBQUksY0FBYyxDQUFDLEtBQUs7WUFDMUQsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDLElBQUksV0FBVyxHQUFHLGFBQWEsRUFDdEksQ0FBQztZQUNGLFdBQVcsRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUNELFdBQVcsRUFBRSxDQUFDO1FBRWQsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLE9BQ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLGNBQWMsQ0FBQyxZQUFZO1lBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVUsR0FBRyxjQUFjLENBQUMsWUFBWTtZQUN0RSxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsSUFBSSxVQUFVLEdBQUcsYUFBYSxFQUNuSSxDQUFDO1lBQ0YsVUFBVSxFQUFFLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxXQUFXLEtBQUssQ0FBQyxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMzQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxrRUFBa0U7UUFDbEUsc0dBQXNHO1FBRXRHLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuQix5QkFBeUI7UUFDekIsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksVUFBVSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDN0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ3JELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQ25FLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUVoRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsZ0JBQWlCLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxDQUFDLGdCQUFpQixDQUFDLGVBQWUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxnQkFBaUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQzNKLElBQUksS0FBSyxHQUFHLFNBQVMsRUFBRSxDQUFDO2dCQUN2QixTQUFTLEdBQUcsS0FBSyxDQUFDO2dCQUNsQixTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ25CLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxTQUFvQixFQUFFLFNBQW9CLEVBQUUsYUFBNkI7UUFDM0csTUFBTSxNQUFNLEdBQW1CLEVBQUUsQ0FBQztRQUNsQyxLQUFLLE1BQU0sQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDO1lBQy9CLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNmLFNBQVM7WUFDVixDQUFDO1lBRUQsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ2xILE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksNEJBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbEgsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsQ0FBQztRQUNGLENBQUM7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFqQkQsZ0RBaUJDO0lBRUQsU0FBZ0Isb0NBQW9DLENBQUMsU0FBaUMsRUFBRSxTQUFpQyxFQUFFLGFBQTZCO1FBQ3ZKLE1BQU0sYUFBYSxHQUFHLDRCQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0UsTUFBTSxVQUFVLEdBQW1CLEVBQUUsQ0FBQztRQUV0QyxJQUFJLFNBQVMsR0FBRyxJQUFJLDBCQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXJDLFNBQVMsUUFBUSxDQUFDLElBQWdCLEVBQUUsWUFBMEI7WUFDN0QsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFFLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0RCxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDaEIsT0FBTztZQUNSLENBQUM7WUFDRCxJQUFJLENBQUMsR0FBRyxJQUFJLDRCQUFZLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFFLENBQUM7WUFFN0MsSUFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFDN0MsSUFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFFN0MsNEZBQTRGO1lBQzVGLHNDQUFzQztZQUV0QyxPQUFPLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2xGLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDakIsTUFBTTtnQkFDUCxDQUFDO2dCQUVELE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5RCxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUQsMEVBQTBFO2dCQUMxRSxNQUFNLENBQUMsR0FBRyxJQUFJLDRCQUFZLENBQUMsRUFBRyxFQUFFLEVBQUcsQ0FBQyxDQUFDO2dCQUNyQyxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBRSxDQUFDO2dCQUVyQyxXQUFXLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7Z0JBQzFDLFdBQVcsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztnQkFFMUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRWQsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUM3RCxrREFBa0Q7b0JBQ2xELGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQztxQkFBTSxDQUFDO29CQUNQLE1BQU07Z0JBQ1AsQ0FBQztZQUNGLENBQUM7WUFFRCxJQUFJLFdBQVcsR0FBRyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDbkYsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixDQUFDO1lBRUQsU0FBUyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxPQUFPLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDakMsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLEtBQUssRUFBRyxDQUFDO1lBQ3BDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDNUIsU0FBUztZQUNWLENBQUM7WUFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pDLHlGQUF5RjtZQUN6RixRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM3RCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUF2RUQsb0ZBdUVDO0lBRUQsU0FBUyxrQkFBa0IsQ0FBQyxjQUE4QixFQUFFLGNBQThCO1FBQ3pGLE1BQU0sTUFBTSxHQUFtQixFQUFFLENBQUM7UUFFbEMsT0FBTyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQy9ELE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFOUIsSUFBSSxJQUFrQixDQUFDO1lBQ3ZCLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNoRSxJQUFJLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRyxDQUFDO1lBQ2hDLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRyxDQUFDO1lBQ2hDLENBQUM7WUFFRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbkcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xFLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25CLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQsU0FBZ0Isd0NBQXdDLENBQUMsU0FBdUIsRUFBRSxVQUF3QixFQUFFLGFBQTZCO1FBQ3hJLElBQUksS0FBSyxHQUFHLGFBQWEsQ0FBQztRQUMxQixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDeEIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksWUFBcUIsQ0FBQztRQUMxQixHQUFHLENBQUM7WUFDSCxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBRXJCLE1BQU0sTUFBTSxHQUFtQjtnQkFDOUIsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNSLENBQUM7WUFFRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN2QyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUU3QyxTQUFTLGVBQWUsQ0FBQyxNQUFvQixFQUFFLEtBQW1CO29CQUNqRSxNQUFNLGNBQWMsR0FBRyxJQUFJLHlCQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFFL0YsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDeEQsTUFBTSxzQkFBc0IsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDaEUsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLElBQUksQ0FBQzsyQkFDbEMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDcEgsT0FBTyxJQUFJLENBQUM7b0JBQ2IsQ0FBQztvQkFFRCxPQUFPLEtBQUssQ0FBQztnQkFDZCxDQUFDO2dCQUVELE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3BELElBQUksVUFBVSxFQUFFLENBQUM7b0JBQ2hCLFlBQVksR0FBRyxJQUFJLENBQUM7b0JBQ3BCLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakUsQ0FBQztxQkFBTSxDQUFDO29CQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLENBQUM7WUFDRixDQUFDO1lBRUQsS0FBSyxHQUFHLE1BQU0sQ0FBQztRQUNoQixDQUFDLFFBQVEsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLFlBQVksRUFBRTtRQUV6QyxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUE3Q0QsNEZBNkNDO0lBRUQsU0FBZ0IsMkNBQTJDLENBQUMsU0FBaUMsRUFBRSxTQUFpQyxFQUFFLGFBQTZCO1FBQzlKLElBQUksS0FBSyxHQUFHLGFBQWEsQ0FBQztRQUMxQixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDeEIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksWUFBcUIsQ0FBQztRQUMxQixHQUFHLENBQUM7WUFDSCxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBRXJCLE1BQU0sTUFBTSxHQUFtQjtnQkFDOUIsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNSLENBQUM7WUFFRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN2QyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUU3QyxTQUFTLGVBQWUsQ0FBQyxNQUFvQixFQUFFLEtBQW1CO29CQUNqRSxNQUFNLGNBQWMsR0FBRyxJQUFJLHlCQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFFL0YsTUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNsRSxJQUFJLGtCQUFrQixHQUFHLENBQUMsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO3dCQUMzRCxPQUFPLEtBQUssQ0FBQztvQkFDZCxDQUFDO29CQUVELE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQy9ELElBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxFQUFFLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQy9FLE9BQU8sS0FBSyxDQUFDO29CQUNkLENBQUM7b0JBRUQsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDbEUsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztvQkFDakQsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDbEUsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztvQkFFakQsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2hFLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO29CQUMvQyxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDaEUsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7b0JBRS9DLCtFQUErRTtvQkFFL0UsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7b0JBQ3hCLFNBQVMsR0FBRyxDQUFDLENBQVM7d0JBQ3JCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ3pCLENBQUM7b0JBRUQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQzswQkFDM0ksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsRUFBRSxHQUFHLGVBQWUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRyxFQUFFLEdBQUcsZUFBZSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQzt3QkFDekssT0FBTyxJQUFJLENBQUM7b0JBQ2IsQ0FBQztvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDZCxDQUFDO2dCQUVELE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3BELElBQUksVUFBVSxFQUFFLENBQUM7b0JBQ2hCLFlBQVksR0FBRyxJQUFJLENBQUM7b0JBQ3BCLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakUsQ0FBQztxQkFBTSxDQUFDO29CQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xCLENBQUM7WUFDRixDQUFDO1lBRUQsS0FBSyxHQUFHLE1BQU0sQ0FBQztRQUNoQixDQUFDLFFBQVEsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLFlBQVksRUFBRTtRQUV6QyxNQUFNLFFBQVEsR0FBbUIsRUFBRSxDQUFDO1FBRXBDLGlDQUFpQztRQUNqQyxJQUFBLDZCQUFvQixFQUFDLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDL0MsSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBRWxCLFNBQVMsbUJBQW1CLENBQUMsSUFBWTtnQkFDeEMsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDeEcsQ0FBQztZQUVELE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUQsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLHlCQUFXLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDekYsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QyxDQUFDO1lBQ0QsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLHlCQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDdkcsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0MsQ0FBQztZQUVELE1BQU0sY0FBYyxHQUFHLDRCQUFZLENBQUMsZUFBZSxDQUNsRCxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQywwQkFBVSxDQUFDLElBQUksRUFDaEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLDBCQUFVLENBQUMsR0FBRyxDQUN4QyxDQUFDO1lBQ0YsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUUsQ0FBQztZQUNsRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1RSxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QixDQUFDO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQztJQUNqQixDQUFDO0lBckdELGtHQXFHQyJ9
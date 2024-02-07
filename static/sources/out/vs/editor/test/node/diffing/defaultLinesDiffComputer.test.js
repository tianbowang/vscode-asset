/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/core/range", "vs/editor/common/diff/rangeMapping", "vs/editor/common/core/offsetRange", "vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer", "vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm", "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/dynamicProgrammingDiffing"], function (require, exports, assert, range_1, rangeMapping_1, offsetRange_1, defaultLinesDiffComputer_1, linesSliceCharSequence_1, myersDiffAlgorithm_1, dynamicProgrammingDiffing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('myers', () => {
        test('1', () => {
            const s1 = new linesSliceCharSequence_1.LinesSliceCharSequence(['hello world'], new offsetRange_1.OffsetRange(0, 1), true);
            const s2 = new linesSliceCharSequence_1.LinesSliceCharSequence(['hallo welt'], new offsetRange_1.OffsetRange(0, 1), true);
            const a = true ? new myersDiffAlgorithm_1.MyersDiffAlgorithm() : new dynamicProgrammingDiffing_1.DynamicProgrammingDiffing();
            a.compute(s1, s2);
        });
    });
    suite('lineRangeMapping', () => {
        test('Simple', () => {
            assert.deepStrictEqual((0, defaultLinesDiffComputer_1.getLineRangeMapping)(new rangeMapping_1.RangeMapping(new range_1.Range(2, 1, 3, 1), new range_1.Range(2, 1, 2, 1)), [
                'const abc = "helloworld".split("");',
                '',
                ''
            ], [
                'const asciiLower = "helloworld".split("");',
                ''
            ]).toString(), "{[2,3)->[2,2)}");
        });
        test('Empty Lines', () => {
            assert.deepStrictEqual((0, defaultLinesDiffComputer_1.getLineRangeMapping)(new rangeMapping_1.RangeMapping(new range_1.Range(2, 1, 2, 1), new range_1.Range(2, 1, 4, 1)), [
                '',
                '',
            ], [
                '',
                '',
                '',
                '',
            ]).toString(), "{[2,2)->[2,4)}");
        });
    });
    suite('LinesSliceCharSequence', () => {
        const sequence = new linesSliceCharSequence_1.LinesSliceCharSequence([
            'line1: foo',
            'line2: fizzbuzz',
            'line3: barr',
            'line4: hello world',
            'line5: bazz',
        ], new offsetRange_1.OffsetRange(1, 4), true);
        test('translateOffset', () => {
            assert.deepStrictEqual({ result: offsetRange_1.OffsetRange.ofLength(sequence.length).map(offset => sequence.translateOffset(offset).toString()) }, ({
                result: [
                    "(2,1)", "(2,2)", "(2,3)", "(2,4)", "(2,5)", "(2,6)", "(2,7)", "(2,8)", "(2,9)", "(2,10)", "(2,11)",
                    "(2,12)", "(2,13)", "(2,14)", "(2,15)", "(2,16)",
                    "(3,1)", "(3,2)", "(3,3)", "(3,4)", "(3,5)", "(3,6)", "(3,7)", "(3,8)", "(3,9)", "(3,10)", "(3,11)", "(3,12)",
                    "(4,1)", "(4,2)", "(4,3)", "(4,4)", "(4,5)", "(4,6)", "(4,7)", "(4,8)", "(4,9)",
                    "(4,10)", "(4,11)", "(4,12)", "(4,13)", "(4,14)", "(4,15)", "(4,16)", "(4,17)",
                    "(4,18)", "(4,19)"
                ]
            }));
        });
        test('extendToFullLines', () => {
            assert.deepStrictEqual({ result: sequence.getText(sequence.extendToFullLines(new offsetRange_1.OffsetRange(20, 25))) }, ({ result: "line3: barr\n" }));
            assert.deepStrictEqual({ result: sequence.getText(sequence.extendToFullLines(new offsetRange_1.OffsetRange(20, 45))) }, ({ result: "line3: barr\nline4: hello world\n" }));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdExpbmVzRGlmZkNvbXB1dGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L25vZGUvZGlmZmluZy9kZWZhdWx0TGluZXNEaWZmQ29tcHV0ZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVdoRyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNuQixJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtZQUNkLE1BQU0sRUFBRSxHQUFHLElBQUksK0NBQXNCLENBQUMsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLHlCQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3BGLE1BQU0sRUFBRSxHQUFHLElBQUksK0NBQXNCLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLHlCQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRW5GLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSx1Q0FBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLHFEQUF5QixFQUFFLENBQUM7WUFDNUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7UUFDOUIsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7WUFDbkIsTUFBTSxDQUFDLGVBQWUsQ0FDckIsSUFBQSw4Q0FBbUIsRUFDbEIsSUFBSSwyQkFBWSxDQUNmLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FB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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/editOperation", "vs/editor/common/core/lineRange", "vs/editor/common/core/range", "vs/base/common/async", "vs/workbench/contrib/chat/common/chatWordCounter"], function (require, exports, editOperation_1, lineRange_1, range_1, async_1, chatWordCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.asProgressiveEdit = exports.performAsyncTextEdit = exports.asRange = exports.invertLineRange = void 0;
    function invertLineRange(range, model) {
        if (range.isEmpty) {
            return [];
        }
        const result = [];
        if (range.startLineNumber > 1) {
            result.push(new lineRange_1.LineRange(1, range.startLineNumber));
        }
        if (range.endLineNumberExclusive < model.getLineCount() + 1) {
            result.push(new lineRange_1.LineRange(range.endLineNumberExclusive, model.getLineCount() + 1));
        }
        return result.filter(r => !r.isEmpty);
    }
    exports.invertLineRange = invertLineRange;
    function asRange(lineRange, model) {
        return lineRange.isEmpty
            ? new range_1.Range(lineRange.startLineNumber, 1, lineRange.startLineNumber, model.getLineLength(lineRange.startLineNumber))
            : new range_1.Range(lineRange.startLineNumber, 1, lineRange.endLineNumberExclusive - 1, model.getLineLength(lineRange.endLineNumberExclusive - 1));
    }
    exports.asRange = asRange;
    async function performAsyncTextEdit(model, edit, progress, obs) {
        const [id] = model.deltaDecorations([], [{
                range: edit.range,
                options: {
                    description: 'asyncTextEdit',
                    stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */
                }
            }]);
        let first = true;
        for await (const part of edit.newText) {
            if (model.isDisposed()) {
                break;
            }
            const range = model.getDecorationRange(id);
            if (!range) {
                throw new Error('FAILED to perform async replace edit because the anchor decoration was removed');
            }
            const edit = first
                ? editOperation_1.EditOperation.replace(range, part) // first edit needs to override the "anchor"
                : editOperation_1.EditOperation.insert(range.getEndPosition(), part);
            obs?.start();
            model.pushEditOperations(null, [edit], (undoEdits) => {
                progress?.report(undoEdits);
                return null;
            });
            obs?.stop();
            first = false;
        }
    }
    exports.performAsyncTextEdit = performAsyncTextEdit;
    function asProgressiveEdit(interval, edit, wordsPerSec, token) {
        wordsPerSec = Math.max(10, wordsPerSec);
        const stream = new async_1.AsyncIterableSource();
        let newText = edit.text ?? '';
        interval.cancelAndSet(() => {
            const r = (0, chatWordCounter_1.getNWords)(newText, 1);
            stream.emitOne(r.value);
            newText = newText.substring(r.value.length);
            if (r.isFullString) {
                interval.cancel();
                stream.resolve();
                d.dispose();
            }
        }, 1000 / wordsPerSec);
        // cancel ASAP
        const d = token.onCancellationRequested(() => {
            interval.cancel();
            stream.resolve();
            d.dispose();
        });
        return {
            range: edit.range,
            newText: stream.asyncIterable
        };
    }
    exports.asProgressiveEdit = asProgressiveEdit;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2lubGluZUNoYXQvYnJvd3Nlci91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsU0FBZ0IsZUFBZSxDQUFDLEtBQWdCLEVBQUUsS0FBaUI7UUFDbEUsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbkIsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQWdCLEVBQUUsQ0FBQztRQUMvQixJQUFJLEtBQUssQ0FBQyxlQUFlLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDRCxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDN0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFTLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBWkQsMENBWUM7SUFFRCxTQUFnQixPQUFPLENBQUMsU0FBb0IsRUFBRSxLQUFpQjtRQUM5RCxPQUFPLFNBQVMsQ0FBQyxPQUFPO1lBQ3ZCLENBQUMsQ0FBQyxJQUFJLGFBQUssQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsZUFB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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestEditorWorkerService = void 0;
    class TestEditorWorkerService {
        canComputeUnicodeHighlights(uri) { return false; }
        async computedUnicodeHighlights(uri) { return { ranges: [], hasMore: false, ambiguousCharacterCount: 0, invisibleCharacterCount: 0, nonBasicAsciiCharacterCount: 0 }; }
        async computeDiff(original, modified, options, algorithm) { return null; }
        canComputeDirtyDiff(original, modified) { return false; }
        async computeDirtyDiff(original, modified, ignoreTrimWhitespace) { return null; }
        async computeMoreMinimalEdits(resource, edits) { return undefined; }
        async computeHumanReadableDiff(resource, edits) { return undefined; }
        canComputeWordRanges(resource) { return false; }
        async computeWordRanges(resource, range) { return null; }
        canNavigateValueSet(resource) { return false; }
        async navigateValueSet(resource, range, up) { return null; }
    }
    exports.TestEditorWorkerService = TestEditorWorkerService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEVkaXRvcldvcmtlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9zZXJ2aWNlcy90ZXN0RWRpdG9yV29ya2VyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSx1QkFBdUI7UUFJbkMsMkJBQTJCLENBQUMsR0FBUSxJQUFhLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoRSxLQUFLLENBQUMseUJBQXlCLENBQUMsR0FBUSxJQUF1QyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixFQUFFLENBQUMsRUFBRSx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9NLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBYSxFQUFFLFFBQWEsRUFBRSxPQUFxQyxFQUFFLFNBQTRCLElBQW1DLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwSyxtQkFBbUIsQ0FBQyxRQUFhLEVBQUUsUUFBYSxJQUFhLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM1RSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBYSxFQUFFLFFBQWEsRUFBRSxvQkFBNkIsSUFBK0IsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9ILEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxRQUFhLEVBQUUsS0FBb0MsSUFBcUMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3pJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxRQUFhLEVBQUUsS0FBb0MsSUFBcUMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzFJLG9CQUFvQixDQUFDLFFBQWEsSUFBYSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDOUQsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFFBQWEsRUFBRSxLQUFhLElBQWtELE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwSCxtQkFBbUIsQ0FBQyxRQUFhLElBQWEsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzdELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFhLEVBQUUsS0FBYSxFQUFFLEVBQVcsSUFBa0QsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ2hJO0lBZkQsMERBZUMifQ==
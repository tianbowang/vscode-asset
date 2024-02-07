/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.diffEditorDefaultOptions = void 0;
    exports.diffEditorDefaultOptions = {
        enableSplitViewResizing: true,
        splitViewDefaultRatio: 0.5,
        renderSideBySide: true,
        renderMarginRevertIcon: true,
        maxComputationTime: 5000,
        maxFileSize: 50,
        ignoreTrimWhitespace: true,
        renderIndicators: true,
        originalEditable: false,
        diffCodeLens: false,
        renderOverviewRuler: true,
        diffWordWrap: 'inherit',
        diffAlgorithm: 'advanced',
        accessibilityVerbose: false,
        experimental: {
            showMoves: false,
            showEmptyDecorations: true,
        },
        hideUnchangedRegions: {
            enabled: false,
            contextLineCount: 3,
            minimumLineCount: 3,
            revealLineCount: 20,
        },
        isInEmbeddedEditor: false,
        onlyShowAccessibleDiffViewer: false,
        renderSideBySideInlineBreakpoint: 900,
        useInlineViewWhenSpaceIsLimited: true,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jb25maWcvZGlmZkVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJbkYsUUFBQSx3QkFBd0IsR0FBRztRQUN2Qyx1QkFBdUIsRUFBRSxJQUFJO1FBQzdCLHFCQUFxQixFQUFFLEdBQUc7UUFDMUIsZ0JBQWdCLEVBQUUsSUFBSTtRQUN0QixzQkFBc0IsRUFBRSxJQUFJO1FBQzVCLGtCQUFrQixFQUFFLElBQUk7UUFDeEIsV0FBVyxFQUFFLEVBQUU7UUFDZixvQkFBb0IsRUFBRSxJQUFJO1FBQzFCLGdCQUFnQixFQUFFLElBQUk7UUFDdEIsZ0JBQWdCLEVBQUUsS0FBSztRQUN2QixZQUFZLEVBQUUsS0FBSztRQUNuQixtQkFBbUIsRUFBRSxJQUFJO1FBQ3pCLFlBQVksRUFBRSxTQUFTO1FBQ3ZCLGFBQWEsRUFBRSxVQUFVO1FBQ3pCLG9CQUFvQixFQUFFLEtBQUs7UUFDM0IsWUFBWSxFQUFFO1lBQ2IsU0FBUyxFQUFFLEtBQUs7WUFDaEIsb0JBQW9CLEVBQUUsSUFBSTtTQUMxQjtRQUNELG9CQUFvQixFQUFFO1lBQ3JCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsZ0JBQWdCLEVBQUUsQ0FBQztZQUNuQixnQkFBZ0IsRUFBRSxDQUFDO1lBQ25CLGVBQWUsRUFBRSxFQUFFO1NBQ25CO1FBQ0Qsa0JBQWtCLEVBQUUsS0FBSztRQUN6Qiw0QkFBNEIsRUFBRSxLQUFLO1FBQ25DLGdDQUFnQyxFQUFFLEdBQUc7UUFDckMsK0JBQStCLEVBQUUsSUFBSTtLQUNBLENBQUMifQ==
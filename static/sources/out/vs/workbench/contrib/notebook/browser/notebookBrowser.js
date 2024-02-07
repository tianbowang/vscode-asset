/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookRange"], function (require, exports, notebookCommon_1, notebookEditorInput_1, notebookRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellFoldingState = exports.cellRangeToViewCells = exports.expandCellRangesWithHiddenCells = exports.getNotebookEditorFromEditorPane = exports.CursorAtLineBoundary = exports.CursorAtBoundary = exports.CellFocusMode = exports.CellEditState = exports.CellRevealRangeType = exports.CellRevealType = exports.NotebookOverviewRulerLane = exports.CellLayoutContext = exports.CellLayoutState = exports.ScrollToRevealBehavior = exports.RenderOutputType = exports.KERNEL_RECOMMENDATIONS = exports.KERNEL_EXTENSIONS = exports.JUPYTER_EXTENSION_ID = exports.IPYNB_VIEW_TYPE = exports.EXPAND_CELL_OUTPUT_COMMAND_ID = exports.QUIT_EDIT_CELL_COMMAND_ID = exports.CHANGE_CELL_LANGUAGE = exports.DETECT_CELL_LANGUAGE = exports.EXECUTE_CELL_COMMAND_ID = exports.EXPAND_CELL_INPUT_COMMAND_ID = void 0;
    //#region Shared commands
    exports.EXPAND_CELL_INPUT_COMMAND_ID = 'notebook.cell.expandCellInput';
    exports.EXECUTE_CELL_COMMAND_ID = 'notebook.cell.execute';
    exports.DETECT_CELL_LANGUAGE = 'notebook.cell.detectLanguage';
    exports.CHANGE_CELL_LANGUAGE = 'notebook.cell.changeLanguage';
    exports.QUIT_EDIT_CELL_COMMAND_ID = 'notebook.cell.quitEdit';
    exports.EXPAND_CELL_OUTPUT_COMMAND_ID = 'notebook.cell.expandCellOutput';
    //#endregion
    //#region Notebook extensions
    // Hardcoding viewType/extension ID for now. TODO these should be replaced once we can
    // look them up in the marketplace dynamically.
    exports.IPYNB_VIEW_TYPE = 'jupyter-notebook';
    exports.JUPYTER_EXTENSION_ID = 'ms-toolsai.jupyter';
    /** @deprecated use the notebookKernel<Type> "keyword" instead */
    exports.KERNEL_EXTENSIONS = new Map([
        [exports.IPYNB_VIEW_TYPE, exports.JUPYTER_EXTENSION_ID],
    ]);
    // @TODO lramos15, place this in a similar spot to our normal recommendations.
    exports.KERNEL_RECOMMENDATIONS = new Map();
    exports.KERNEL_RECOMMENDATIONS.set(exports.IPYNB_VIEW_TYPE, new Map());
    exports.KERNEL_RECOMMENDATIONS.get(exports.IPYNB_VIEW_TYPE)?.set('python', {
        extensionIds: [
            'ms-python.python',
            exports.JUPYTER_EXTENSION_ID
        ],
        displayName: 'Python + Jupyter',
    });
    //#endregion
    //#region  Output related types
    // !! IMPORTANT !! ----------------------------------------------------------------------------------
    // NOTE that you MUST update vs/workbench/contrib/notebook/browser/view/renderers/webviewPreloads.ts#L1986
    // whenever changing the values of this const enum. The webviewPreloads-files manually inlines these values
    // because it cannot have dependencies.
    // !! IMPORTANT !! ----------------------------------------------------------------------------------
    var RenderOutputType;
    (function (RenderOutputType) {
        RenderOutputType[RenderOutputType["Html"] = 0] = "Html";
        RenderOutputType[RenderOutputType["Extension"] = 1] = "Extension";
    })(RenderOutputType || (exports.RenderOutputType = RenderOutputType = {}));
    var ScrollToRevealBehavior;
    (function (ScrollToRevealBehavior) {
        ScrollToRevealBehavior[ScrollToRevealBehavior["fullCell"] = 0] = "fullCell";
        ScrollToRevealBehavior[ScrollToRevealBehavior["firstLine"] = 1] = "firstLine";
    })(ScrollToRevealBehavior || (exports.ScrollToRevealBehavior = ScrollToRevealBehavior = {}));
    //#endregion
    var CellLayoutState;
    (function (CellLayoutState) {
        CellLayoutState[CellLayoutState["Uninitialized"] = 0] = "Uninitialized";
        CellLayoutState[CellLayoutState["Estimated"] = 1] = "Estimated";
        CellLayoutState[CellLayoutState["FromCache"] = 2] = "FromCache";
        CellLayoutState[CellLayoutState["Measured"] = 3] = "Measured";
    })(CellLayoutState || (exports.CellLayoutState = CellLayoutState = {}));
    var CellLayoutContext;
    (function (CellLayoutContext) {
        CellLayoutContext[CellLayoutContext["Fold"] = 0] = "Fold";
    })(CellLayoutContext || (exports.CellLayoutContext = CellLayoutContext = {}));
    /**
     * Vertical Lane in the overview ruler of the notebook editor.
     */
    var NotebookOverviewRulerLane;
    (function (NotebookOverviewRulerLane) {
        NotebookOverviewRulerLane[NotebookOverviewRulerLane["Left"] = 1] = "Left";
        NotebookOverviewRulerLane[NotebookOverviewRulerLane["Center"] = 2] = "Center";
        NotebookOverviewRulerLane[NotebookOverviewRulerLane["Right"] = 4] = "Right";
        NotebookOverviewRulerLane[NotebookOverviewRulerLane["Full"] = 7] = "Full";
    })(NotebookOverviewRulerLane || (exports.NotebookOverviewRulerLane = NotebookOverviewRulerLane = {}));
    var CellRevealType;
    (function (CellRevealType) {
        CellRevealType[CellRevealType["Default"] = 1] = "Default";
        CellRevealType[CellRevealType["Top"] = 2] = "Top";
        CellRevealType[CellRevealType["Center"] = 3] = "Center";
        CellRevealType[CellRevealType["CenterIfOutsideViewport"] = 4] = "CenterIfOutsideViewport";
        CellRevealType[CellRevealType["NearTopIfOutsideViewport"] = 5] = "NearTopIfOutsideViewport";
        CellRevealType[CellRevealType["FirstLineIfOutsideViewport"] = 6] = "FirstLineIfOutsideViewport";
    })(CellRevealType || (exports.CellRevealType = CellRevealType = {}));
    var CellRevealRangeType;
    (function (CellRevealRangeType) {
        CellRevealRangeType[CellRevealRangeType["Default"] = 1] = "Default";
        CellRevealRangeType[CellRevealRangeType["Center"] = 2] = "Center";
        CellRevealRangeType[CellRevealRangeType["CenterIfOutsideViewport"] = 3] = "CenterIfOutsideViewport";
    })(CellRevealRangeType || (exports.CellRevealRangeType = CellRevealRangeType = {}));
    var CellEditState;
    (function (CellEditState) {
        /**
         * Default state.
         * For markup cells, this is the renderer version of the markup.
         * For code cell, the browser focus should be on the container instead of the editor
         */
        CellEditState[CellEditState["Preview"] = 0] = "Preview";
        /**
         * Editing mode. Source for markup or code is rendered in editors and the state will be persistent.
         */
        CellEditState[CellEditState["Editing"] = 1] = "Editing";
    })(CellEditState || (exports.CellEditState = CellEditState = {}));
    var CellFocusMode;
    (function (CellFocusMode) {
        CellFocusMode[CellFocusMode["Container"] = 0] = "Container";
        CellFocusMode[CellFocusMode["Editor"] = 1] = "Editor";
        CellFocusMode[CellFocusMode["Output"] = 2] = "Output";
        CellFocusMode[CellFocusMode["ChatInput"] = 3] = "ChatInput";
    })(CellFocusMode || (exports.CellFocusMode = CellFocusMode = {}));
    var CursorAtBoundary;
    (function (CursorAtBoundary) {
        CursorAtBoundary[CursorAtBoundary["None"] = 0] = "None";
        CursorAtBoundary[CursorAtBoundary["Top"] = 1] = "Top";
        CursorAtBoundary[CursorAtBoundary["Bottom"] = 2] = "Bottom";
        CursorAtBoundary[CursorAtBoundary["Both"] = 3] = "Both";
    })(CursorAtBoundary || (exports.CursorAtBoundary = CursorAtBoundary = {}));
    var CursorAtLineBoundary;
    (function (CursorAtLineBoundary) {
        CursorAtLineBoundary[CursorAtLineBoundary["None"] = 0] = "None";
        CursorAtLineBoundary[CursorAtLineBoundary["Start"] = 1] = "Start";
        CursorAtLineBoundary[CursorAtLineBoundary["End"] = 2] = "End";
        CursorAtLineBoundary[CursorAtLineBoundary["Both"] = 3] = "Both";
    })(CursorAtLineBoundary || (exports.CursorAtLineBoundary = CursorAtLineBoundary = {}));
    function getNotebookEditorFromEditorPane(editorPane) {
        if (!editorPane) {
            return;
        }
        if (editorPane.getId() === notebookCommon_1.NOTEBOOK_EDITOR_ID) {
            return editorPane.getControl();
        }
        const input = editorPane.input;
        if (input && (0, notebookEditorInput_1.isCompositeNotebookEditorInput)(input)) {
            return editorPane.getControl()?.notebookEditor;
        }
        return undefined;
    }
    exports.getNotebookEditorFromEditorPane = getNotebookEditorFromEditorPane;
    /**
     * ranges: model selections
     * this will convert model selections to view indexes first, and then include the hidden ranges in the list view
     */
    function expandCellRangesWithHiddenCells(editor, ranges) {
        // assuming ranges are sorted and no overlap
        const indexes = (0, notebookRange_1.cellRangesToIndexes)(ranges);
        const modelRanges = [];
        indexes.forEach(index => {
            const viewCell = editor.cellAt(index);
            if (!viewCell) {
                return;
            }
            const viewIndex = editor.getViewIndexByModelIndex(index);
            if (viewIndex < 0) {
                return;
            }
            const nextViewIndex = viewIndex + 1;
            const range = editor.getCellRangeFromViewRange(viewIndex, nextViewIndex);
            if (range) {
                modelRanges.push(range);
            }
        });
        return (0, notebookRange_1.reduceCellRanges)(modelRanges);
    }
    exports.expandCellRangesWithHiddenCells = expandCellRangesWithHiddenCells;
    function cellRangeToViewCells(editor, ranges) {
        const cells = [];
        (0, notebookRange_1.reduceCellRanges)(ranges).forEach(range => {
            cells.push(...editor.getCellsInRange(range));
        });
        return cells;
    }
    exports.cellRangeToViewCells = cellRangeToViewCells;
    //#region Cell Folding
    var CellFoldingState;
    (function (CellFoldingState) {
        CellFoldingState[CellFoldingState["None"] = 0] = "None";
        CellFoldingState[CellFoldingState["Expanded"] = 1] = "Expanded";
        CellFoldingState[CellFoldingState["Collapsed"] = 2] = "Collapsed";
    })(CellFoldingState || (exports.CellFoldingState = CellFoldingState = {}));
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tCcm93c2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL25vdGVib29rQnJvd3Nlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUErQmhHLHlCQUF5QjtJQUNaLFFBQUEsNEJBQTRCLEdBQUcsK0JBQStCLENBQUM7SUFDL0QsUUFBQSx1QkFBdUIsR0FBRyx1QkFBdUIsQ0FBQztJQUNsRCxRQUFBLG9CQUFvQixHQUFHLDhCQUE4QixDQUFDO0lBQ3RELFFBQUEsb0JBQW9CLEdBQUcsOEJBQThCLENBQUM7SUFDdEQsUUFBQSx5QkFBeUIsR0FBRyx3QkFBd0IsQ0FBQztJQUNyRCxRQUFBLDZCQUE2QixHQUFHLGdDQUFnQyxDQUFDO0lBRzlFLFlBQVk7SUFFWiw2QkFBNkI7SUFFN0Isc0ZBQXNGO0lBQ3RGLCtDQUErQztJQUNsQyxRQUFBLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQztJQUNyQyxRQUFBLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDO0lBQ3pELGlFQUFpRTtJQUNwRCxRQUFBLGlCQUFpQixHQUFHLElBQUksR0FBRyxDQUFpQjtRQUN4RCxDQUFDLHVCQUFlLEVBQUUsNEJBQW9CLENBQUM7S0FDdkMsQ0FBQyxDQUFDO0lBQ0gsOEVBQThFO0lBQ2pFLFFBQUEsc0JBQXNCLEdBQUcsSUFBSSxHQUFHLEVBQXlELENBQUM7SUFDdkcsOEJBQXNCLENBQUMsR0FBRyxDQUFDLHVCQUFlLEVBQUUsSUFBSSxHQUFHLEVBQTRDLENBQUMsQ0FBQztJQUNqRyw4QkFBc0IsQ0FBQyxHQUFHLENBQUMsdUJBQWUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUU7UUFDMUQsWUFBWSxFQUFFO1lBQ2Isa0JBQWtCO1lBQ2xCLDRCQUFvQjtTQUNwQjtRQUNELFdBQVcsRUFBRSxr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
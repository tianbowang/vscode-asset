/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/editor"], function (require, exports, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.applyTextEditorOptions = void 0;
    function applyTextEditorOptions(options, editor, scrollType) {
        let applied = false;
        // Restore view state if any
        const viewState = massageEditorViewState(options);
        if ((0, editor_1.isTextEditorViewState)(viewState)) {
            editor.restoreViewState(viewState);
            applied = true;
        }
        // Restore selection if any
        if (options.selection) {
            const range = {
                startLineNumber: options.selection.startLineNumber,
                startColumn: options.selection.startColumn,
                endLineNumber: options.selection.endLineNumber ?? options.selection.startLineNumber,
                endColumn: options.selection.endColumn ?? options.selection.startColumn
            };
            // Apply selection with a source so that listeners can
            // distinguish this selection change from others.
            // If no source is provided, set a default source to
            // signal this navigation.
            editor.setSelection(range, options.selectionSource ?? "code.navigation" /* TextEditorSelectionSource.NAVIGATION */);
            // Reveal selection
            if (options.selectionRevealType === 2 /* TextEditorSelectionRevealType.NearTop */) {
                editor.revealRangeNearTop(range, scrollType);
            }
            else if (options.selectionRevealType === 3 /* TextEditorSelectionRevealType.NearTopIfOutsideViewport */) {
                editor.revealRangeNearTopIfOutsideViewport(range, scrollType);
            }
            else if (options.selectionRevealType === 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */) {
                editor.revealRangeInCenterIfOutsideViewport(range, scrollType);
            }
            else {
                editor.revealRangeInCenter(range, scrollType);
            }
            applied = true;
        }
        return applied;
    }
    exports.applyTextEditorOptions = applyTextEditorOptions;
    function massageEditorViewState(options) {
        // Without a selection or view state, just return immediately
        if (!options.selection || !options.viewState) {
            return options.viewState;
        }
        // Diff editor: since we have an explicit selection, clear the
        // cursor state from the modified side where the selection
        // applies. This avoids a redundant selection change event.
        const candidateDiffViewState = options.viewState;
        if (candidateDiffViewState.modified) {
            candidateDiffViewState.modified.cursorState = [];
            return candidateDiffViewState;
        }
        // Code editor: since we have an explicit selection, clear the
        // cursor state. This avoids a redundant selection change event.
        const candidateEditorViewState = options.viewState;
        if (candidateEditorViewState.cursorState) {
            candidateEditorViewState.cursorState = [];
        }
        return candidateEditorViewState;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yT3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbW1vbi9lZGl0b3IvZWRpdG9yT3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsU0FBZ0Isc0JBQXNCLENBQUMsT0FBMkIsRUFBRSxNQUFlLEVBQUUsVUFBc0I7UUFDMUcsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBRXBCLDRCQUE0QjtRQUM1QixNQUFNLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxJQUFJLElBQUEsOEJBQXFCLEVBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUN0QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFbkMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsMkJBQTJCO1FBQzNCLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sS0FBSyxHQUFXO2dCQUNyQixlQUFlLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxlQUFlO2dCQUNsRCxXQUFXLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXO2dCQUMxQyxhQUFhLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxhQUFhLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxlQUFlO2dCQUNuRixTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXO2FBQ3ZFLENBQUM7WUFFRixzREFBc0Q7WUFDdEQsaURBQWlEO1lBQ2pELG9EQUFvRDtZQUNwRCwwQkFBMEI7WUFDMUIsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLGVBQWUsZ0VBQXdDLENBQUMsQ0FBQztZQUU1RixtQkFBbUI7WUFDbkIsSUFBSSxPQUFPLENBQUMsbUJBQW1CLGtEQUEwQyxFQUFFLENBQUM7Z0JBQzNFLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUMsQ0FBQztpQkFBTSxJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsbUVBQTJELEVBQUUsQ0FBQztnQkFDbkcsTUFBTSxDQUFDLG1DQUFtQyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvRCxDQUFDO2lCQUFNLElBQUksT0FBTyxDQUFDLG1CQUFtQixrRUFBMEQsRUFBRSxDQUFDO2dCQUNsRyxNQUFNLENBQUMsb0NBQW9DLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2hFLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQy9DLENBQUM7WUFFRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBekNELHdEQXlDQztJQUVELFNBQVMsc0JBQXNCLENBQUMsT0FBMkI7UUFFMUQsNkRBQTZEO1FBQzdELElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzlDLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDO1FBRUQsOERBQThEO1FBQzlELDBEQUEwRDtRQUMxRCwyREFBMkQ7UUFDM0QsTUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsU0FBaUMsQ0FBQztRQUN6RSxJQUFJLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBRWpELE9BQU8sc0JBQXNCLENBQUM7UUFDL0IsQ0FBQztRQUVELDhEQUE4RDtRQUM5RCxnRUFBZ0U7UUFDaEUsTUFBTSx3QkFBd0IsR0FBRyxPQUFPLENBQUMsU0FBaUMsQ0FBQztRQUMzRSxJQUFJLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzFDLHdCQUF3QixDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDM0MsQ0FBQztRQUVELE9BQU8sd0JBQXdCLENBQUM7SUFDakMsQ0FBQyJ9
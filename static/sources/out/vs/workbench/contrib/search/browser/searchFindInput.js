/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFindReplaceWidget", "vs/nls"], function (require, exports, contextScopedHistoryWidget_1, notebookFindReplaceWidget_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchFindInput = void 0;
    class SearchFindInput extends contextScopedHistoryWidget_1.ContextScopedFindInput {
        constructor(container, contextViewProvider, options, contextKeyService, contextMenuService, instantiationService, filters, filterStartVisiblitity) {
            super(container, contextViewProvider, options, contextKeyService);
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.filters = filters;
            this._filterChecked = false;
            this._visible = false;
            this._findFilter = this._register(new notebookFindReplaceWidget_1.NotebookFindInputFilterButton(filters, contextMenuService, instantiationService, options, nls.localize('searchFindInputNotebookFilter.label', "Notebook Find Filters")));
            this.inputBox.paddingRight = (this.caseSensitive?.width() ?? 0) + (this.wholeWords?.width() ?? 0) + (this.regex?.width() ?? 0) + this._findFilter.width;
            this.controls.appendChild(this._findFilter.container);
            this._findFilter.container.classList.add('monaco-custom-toggle');
            this.filterVisible = filterStartVisiblitity;
        }
        set filterVisible(show) {
            this._findFilter.container.style.display = show ? '' : 'none';
            this._visible = show;
            this.updateStyles();
        }
        setEnabled(enabled) {
            super.setEnabled(enabled);
            if (enabled && (!this._filterChecked || !this._visible)) {
                this.regex?.enable();
            }
            else {
                this.regex?.disable();
            }
        }
        updateStyles() {
            // filter is checked if it's in a non-default state
            this._filterChecked =
                !this.filters.markupInput ||
                    !this.filters.markupPreview ||
                    !this.filters.codeInput ||
                    !this.filters.codeOutput;
            // TODO: find a way to express that searching notebook output and markdown preview don't support regex.
            this._findFilter.applyStyles(this._filterChecked);
        }
    }
    exports.SearchFindInput = SearchFindInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoRmluZElucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9zZWFyY2hGaW5kSW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQWEsZUFBZ0IsU0FBUSxtREFBc0I7UUFLMUQsWUFDQyxTQUE2QixFQUM3QixtQkFBeUMsRUFDekMsT0FBMEIsRUFDMUIsaUJBQXFDLEVBQzVCLGtCQUF1QyxFQUN2QyxvQkFBMkMsRUFDM0MsT0FBNEIsRUFDckMsc0JBQStCO1lBRS9CLEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFMekQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN2Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzNDLFlBQU8sR0FBUCxPQUFPLENBQXFCO1lBVjlCLG1CQUFjLEdBQVksS0FBSyxDQUFDO1lBQ2hDLGFBQVEsR0FBWSxLQUFLLENBQUM7WUFhakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUNoQyxJQUFJLHlEQUE2QixDQUNoQyxPQUFPLEVBQ1Asa0JBQWtCLEVBQ2xCLG9CQUFvQixFQUNwQixPQUFPLEVBQ1AsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSx1QkFBdUIsQ0FBQyxDQUM1RSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUN4SixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUVqRSxJQUFJLENBQUMsYUFBYSxHQUFHLHNCQUFzQixDQUFDO1FBQzdDLENBQUM7UUFFRCxJQUFJLGFBQWEsQ0FBQyxJQUFhO1lBQzlCLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUM5RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNyQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDckIsQ0FBQztRQUVRLFVBQVUsQ0FBQyxPQUFnQjtZQUNuQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFCLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDdEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDdkIsQ0FBQztRQUNGLENBQUM7UUFFRCxZQUFZO1lBQ1gsbURBQW1EO1lBQ25ELElBQUksQ0FBQyxjQUFjO2dCQUNsQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVztvQkFDekIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWE7b0JBQzNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTO29CQUN2QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBRTFCLHVHQUF1RztZQUV2RyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbkQsQ0FBQztLQUNEO0lBMURELDBDQTBEQyJ9
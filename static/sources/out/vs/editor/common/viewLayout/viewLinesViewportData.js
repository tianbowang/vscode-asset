/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/range"], function (require, exports, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewportData = void 0;
    /**
     * Contains all data needed to render at a specific viewport.
     */
    class ViewportData {
        constructor(selections, partialData, whitespaceViewportData, model) {
            this.selections = selections;
            this.startLineNumber = partialData.startLineNumber | 0;
            this.endLineNumber = partialData.endLineNumber | 0;
            this.relativeVerticalOffset = partialData.relativeVerticalOffset;
            this.bigNumbersDelta = partialData.bigNumbersDelta | 0;
            this.whitespaceViewportData = whitespaceViewportData;
            this._model = model;
            this.visibleRange = new range_1.Range(partialData.startLineNumber, this._model.getLineMinColumn(partialData.startLineNumber), partialData.endLineNumber, this._model.getLineMaxColumn(partialData.endLineNumber));
        }
        getViewLineRenderingData(lineNumber) {
            return this._model.getViewportViewLineRenderingData(this.visibleRange, lineNumber);
        }
        getDecorationsInViewport() {
            return this._model.getDecorationsInViewport(this.visibleRange);
        }
    }
    exports.ViewportData = ViewportData;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0xpbmVzVmlld3BvcnREYXRhLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3ZpZXdMYXlvdXQvdmlld0xpbmVzVmlld3BvcnREYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRzs7T0FFRztJQUNILE1BQWEsWUFBWTtRQW9DeEIsWUFDQyxVQUF1QixFQUN2QixXQUEwQyxFQUMxQyxzQkFBcUQsRUFDckQsS0FBaUI7WUFFakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDN0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxXQUFXLENBQUMsc0JBQXNCLENBQUM7WUFDakUsSUFBSSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsc0JBQXNCLENBQUM7WUFFckQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFFcEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLGFBQUssQ0FDNUIsV0FBVyxDQUFDLGVBQWUsRUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEVBQ3pELFdBQVcsQ0FBQyxhQUFhLEVBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUN2RCxDQUFDO1FBQ0gsQ0FBQztRQUVNLHdCQUF3QixDQUFDLFVBQWtCO1lBQ2pELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFTSx3QkFBd0I7WUFDOUIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNoRSxDQUFDO0tBQ0Q7SUFsRUQsb0NBa0VDIn0=
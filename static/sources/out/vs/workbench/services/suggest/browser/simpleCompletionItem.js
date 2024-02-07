/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters"], function (require, exports, filters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleCompletionItem = void 0;
    class SimpleCompletionItem {
        constructor(completion) {
            this.completion = completion;
            // sorting, filtering
            this.score = filters_1.FuzzyScore.Default;
            this.distance = 0;
            // ensure lower-variants (perf)
            this.labelLow = this.completion.label.toLowerCase();
        }
    }
    exports.SimpleCompletionItem = SimpleCompletionItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlQ29tcGxldGlvbkl0ZW0uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zdWdnZXN0L2Jyb3dzZXIvc2ltcGxlQ29tcGxldGlvbkl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0JoRyxNQUFhLG9CQUFvQjtRQVVoQyxZQUNVLFVBQTZCO1lBQTdCLGVBQVUsR0FBVixVQUFVLENBQW1CO1lBUHZDLHFCQUFxQjtZQUNyQixVQUFLLEdBQWUsb0JBQVUsQ0FBQyxPQUFPLENBQUM7WUFDdkMsYUFBUSxHQUFXLENBQUMsQ0FBQztZQU9wQiwrQkFBK0I7WUFDL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNyRCxDQUFDO0tBQ0Q7SUFoQkQsb0RBZ0JDIn0=
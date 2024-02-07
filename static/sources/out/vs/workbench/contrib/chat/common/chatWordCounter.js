/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.countWords = exports.getNWords = void 0;
    const wordSeparatorCharPattern = /[\s\|\-]/;
    function getNWords(str, numWordsToCount) {
        let wordCount = numWordsToCount;
        let i = 0;
        while (i < str.length && wordCount > 0) {
            // Consume word separator chars
            while (i < str.length && str[i].match(wordSeparatorCharPattern)) {
                i++;
            }
            // Consume word chars
            while (i < str.length && !str[i].match(wordSeparatorCharPattern)) {
                i++;
            }
            wordCount--;
        }
        const value = str.substring(0, i);
        return {
            value,
            actualWordCount: numWordsToCount - wordCount,
            isFullString: i >= str.length
        };
    }
    exports.getNWords = getNWords;
    function countWords(str) {
        const result = getNWords(str, Number.MAX_SAFE_INTEGER);
        return result.actualWordCount;
    }
    exports.countWords = countWords;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFdvcmRDb3VudGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L2NvbW1vbi9jaGF0V29yZENvdW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLE1BQU0sd0JBQXdCLEdBQUcsVUFBVSxDQUFDO0lBUTVDLFNBQWdCLFNBQVMsQ0FBQyxHQUFXLEVBQUUsZUFBdUI7UUFDN0QsSUFBSSxTQUFTLEdBQUcsZUFBZSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3hDLCtCQUErQjtZQUMvQixPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsRUFBRSxDQUFDO2dCQUNqRSxDQUFDLEVBQUUsQ0FBQztZQUNMLENBQUM7WUFFRCxxQkFBcUI7WUFDckIsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsRUFBRSxDQUFDO2dCQUNsRSxDQUFDLEVBQUUsQ0FBQztZQUNMLENBQUM7WUFFRCxTQUFTLEVBQUUsQ0FBQztRQUNiLENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsQyxPQUFPO1lBQ04sS0FBSztZQUNMLGVBQWUsRUFBRSxlQUFlLEdBQUcsU0FBUztZQUM1QyxZQUFZLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNO1NBQzdCLENBQUM7SUFDSCxDQUFDO0lBdkJELDhCQXVCQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxHQUFXO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdkQsT0FBTyxNQUFNLENBQUMsZUFBZSxDQUFDO0lBQy9CLENBQUM7SUFIRCxnQ0FHQyJ9
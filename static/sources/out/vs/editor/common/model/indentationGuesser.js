/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.guessIndentation = void 0;
    class SpacesDiffResult {
        constructor() {
            this.spacesDiff = 0;
            this.looksLikeAlignment = false;
        }
    }
    /**
     * Compute the diff in spaces between two line's indentation.
     */
    function spacesDiff(a, aLength, b, bLength, result) {
        result.spacesDiff = 0;
        result.looksLikeAlignment = false;
        // This can go both ways (e.g.):
        //  - a: "\t"
        //  - b: "\t    "
        //  => This should count 1 tab and 4 spaces
        let i;
        for (i = 0; i < aLength && i < bLength; i++) {
            const aCharCode = a.charCodeAt(i);
            const bCharCode = b.charCodeAt(i);
            if (aCharCode !== bCharCode) {
                break;
            }
        }
        let aSpacesCnt = 0, aTabsCount = 0;
        for (let j = i; j < aLength; j++) {
            const aCharCode = a.charCodeAt(j);
            if (aCharCode === 32 /* CharCode.Space */) {
                aSpacesCnt++;
            }
            else {
                aTabsCount++;
            }
        }
        let bSpacesCnt = 0, bTabsCount = 0;
        for (let j = i; j < bLength; j++) {
            const bCharCode = b.charCodeAt(j);
            if (bCharCode === 32 /* CharCode.Space */) {
                bSpacesCnt++;
            }
            else {
                bTabsCount++;
            }
        }
        if (aSpacesCnt > 0 && aTabsCount > 0) {
            return;
        }
        if (bSpacesCnt > 0 && bTabsCount > 0) {
            return;
        }
        const tabsDiff = Math.abs(aTabsCount - bTabsCount);
        const spacesDiff = Math.abs(aSpacesCnt - bSpacesCnt);
        if (tabsDiff === 0) {
            // check if the indentation difference might be caused by alignment reasons
            // sometime folks like to align their code, but this should not be used as a hint
            result.spacesDiff = spacesDiff;
            if (spacesDiff > 0 && 0 <= bSpacesCnt - 1 && bSpacesCnt - 1 < a.length && bSpacesCnt < b.length) {
                if (b.charCodeAt(bSpacesCnt) !== 32 /* CharCode.Space */ && a.charCodeAt(bSpacesCnt - 1) === 32 /* CharCode.Space */) {
                    if (a.charCodeAt(a.length - 1) === 44 /* CharCode.Comma */) {
                        // This looks like an alignment desire: e.g.
                        // const a = b + c,
                        //       d = b - c;
                        result.looksLikeAlignment = true;
                    }
                }
            }
            return;
        }
        if (spacesDiff % tabsDiff === 0) {
            result.spacesDiff = spacesDiff / tabsDiff;
            return;
        }
    }
    function guessIndentation(source, defaultTabSize, defaultInsertSpaces) {
        // Look at most at the first 10k lines
        const linesCount = Math.min(source.getLineCount(), 10000);
        let linesIndentedWithTabsCount = 0; // number of lines that contain at least one tab in indentation
        let linesIndentedWithSpacesCount = 0; // number of lines that contain only spaces in indentation
        let previousLineText = ''; // content of latest line that contained non-whitespace chars
        let previousLineIndentation = 0; // index at which latest line contained the first non-whitespace char
        const ALLOWED_TAB_SIZE_GUESSES = [2, 4, 6, 8, 3, 5, 7]; // prefer even guesses for `tabSize`, limit to [2, 8].
        const MAX_ALLOWED_TAB_SIZE_GUESS = 8; // max(ALLOWED_TAB_SIZE_GUESSES) = 8
        const spacesDiffCount = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // `tabSize` scores
        const tmp = new SpacesDiffResult();
        for (let lineNumber = 1; lineNumber <= linesCount; lineNumber++) {
            const currentLineLength = source.getLineLength(lineNumber);
            const currentLineText = source.getLineContent(lineNumber);
            // if the text buffer is chunk based, so long lines are cons-string, v8 will flattern the string when we check charCode.
            // checking charCode on chunks directly is cheaper.
            const useCurrentLineText = (currentLineLength <= 65536);
            let currentLineHasContent = false; // does `currentLineText` contain non-whitespace chars
            let currentLineIndentation = 0; // index at which `currentLineText` contains the first non-whitespace char
            let currentLineSpacesCount = 0; // count of spaces found in `currentLineText` indentation
            let currentLineTabsCount = 0; // count of tabs found in `currentLineText` indentation
            for (let j = 0, lenJ = currentLineLength; j < lenJ; j++) {
                const charCode = (useCurrentLineText ? currentLineText.charCodeAt(j) : source.getLineCharCode(lineNumber, j));
                if (charCode === 9 /* CharCode.Tab */) {
                    currentLineTabsCount++;
                }
                else if (charCode === 32 /* CharCode.Space */) {
                    currentLineSpacesCount++;
                }
                else {
                    // Hit non whitespace character on this line
                    currentLineHasContent = true;
                    currentLineIndentation = j;
                    break;
                }
            }
            // Ignore empty or only whitespace lines
            if (!currentLineHasContent) {
                continue;
            }
            if (currentLineTabsCount > 0) {
                linesIndentedWithTabsCount++;
            }
            else if (currentLineSpacesCount > 1) {
                linesIndentedWithSpacesCount++;
            }
            spacesDiff(previousLineText, previousLineIndentation, currentLineText, currentLineIndentation, tmp);
            if (tmp.looksLikeAlignment) {
                // if defaultInsertSpaces === true && the spaces count == tabSize, we may want to count it as valid indentation
                //
                // - item1
                //   - item2
                //
                // otherwise skip this line entirely
                //
                // const a = 1,
                //       b = 2;
                if (!(defaultInsertSpaces && defaultTabSize === tmp.spacesDiff)) {
                    continue;
                }
            }
            const currentSpacesDiff = tmp.spacesDiff;
            if (currentSpacesDiff <= MAX_ALLOWED_TAB_SIZE_GUESS) {
                spacesDiffCount[currentSpacesDiff]++;
            }
            previousLineText = currentLineText;
            previousLineIndentation = currentLineIndentation;
        }
        let insertSpaces = defaultInsertSpaces;
        if (linesIndentedWithTabsCount !== linesIndentedWithSpacesCount) {
            insertSpaces = (linesIndentedWithTabsCount < linesIndentedWithSpacesCount);
        }
        let tabSize = defaultTabSize;
        // Guess tabSize only if inserting spaces...
        if (insertSpaces) {
            let tabSizeScore = (insertSpaces ? 0 : 0.1 * linesCount);
            // console.log("score threshold: " + tabSizeScore);
            ALLOWED_TAB_SIZE_GUESSES.forEach((possibleTabSize) => {
                const possibleTabSizeScore = spacesDiffCount[possibleTabSize];
                if (possibleTabSizeScore > tabSizeScore) {
                    tabSizeScore = possibleTabSizeScore;
                    tabSize = possibleTabSize;
                }
            });
            // Let a tabSize of 2 win even if it is not the maximum
            // (only in case 4 was guessed)
            if (tabSize === 4 && spacesDiffCount[4] > 0 && spacesDiffCount[2] > 0 && spacesDiffCount[2] >= spacesDiffCount[4] / 2) {
                tabSize = 2;
            }
        }
        // console.log('--------------------------');
        // console.log('linesIndentedWithTabsCount: ' + linesIndentedWithTabsCount + ', linesIndentedWithSpacesCount: ' + linesIndentedWithSpacesCount);
        // console.log('spacesDiffCount: ' + spacesDiffCount);
        // console.log('tabSize: ' + tabSize + ', tabSizeScore: ' + tabSizeScore);
        return {
            insertSpaces: insertSpaces,
            tabSize: tabSize
        };
    }
    exports.guessIndentation = guessIndentation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZW50YXRpb25HdWVzc2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL21vZGVsL2luZGVudGF0aW9uR3Vlc3Nlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsTUFBTSxnQkFBZ0I7UUFBdEI7WUFDUSxlQUFVLEdBQVcsQ0FBQyxDQUFDO1lBQ3ZCLHVCQUFrQixHQUFZLEtBQUssQ0FBQztRQUM1QyxDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNILFNBQVMsVUFBVSxDQUFDLENBQVMsRUFBRSxPQUFlLEVBQUUsQ0FBUyxFQUFFLE9BQWUsRUFBRSxNQUF3QjtRQUVuRyxNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO1FBRWxDLGdDQUFnQztRQUNoQyxhQUFhO1FBQ2IsaUJBQWlCO1FBQ2pCLDJDQUEyQztRQUUzQyxJQUFJLENBQVMsQ0FBQztRQUVkLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxJQUFJLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM3QyxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbEMsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzdCLE1BQU07WUFDUCxDQUFDO1FBQ0YsQ0FBQztRQUVELElBQUksVUFBVSxHQUFHLENBQUMsRUFBRSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNsQyxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksU0FBUyw0QkFBbUIsRUFBRSxDQUFDO2dCQUNsQyxVQUFVLEVBQUUsQ0FBQztZQUNkLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxVQUFVLEVBQUUsQ0FBQztZQUNkLENBQUM7UUFDRixDQUFDO1FBRUQsSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxTQUFTLDRCQUFtQixFQUFFLENBQUM7Z0JBQ2xDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFVBQVUsRUFBRSxDQUFDO1lBQ2QsQ0FBQztRQUNGLENBQUM7UUFFRCxJQUFJLFVBQVUsR0FBRyxDQUFDLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3RDLE9BQU87UUFDUixDQUFDO1FBQ0QsSUFBSSxVQUFVLEdBQUcsQ0FBQyxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUN0QyxPQUFPO1FBQ1IsQ0FBQztRQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBRXJELElBQUksUUFBUSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3BCLDJFQUEyRTtZQUMzRSxpRkFBaUY7WUFDakYsTUFBTSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFFL0IsSUFBSSxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxJQUFJLFVBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNqRyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLDRCQUFtQixJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyw0QkFBbUIsRUFBRSxDQUFDO29CQUNwRyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsNEJBQW1CLEVBQUUsQ0FBQzt3QkFDbkQsNENBQTRDO3dCQUM1QyxtQkFBbUI7d0JBQ25CLG1CQUFtQjt3QkFDbkIsTUFBTSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztvQkFDbEMsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUNELE9BQU87UUFDUixDQUFDO1FBQ0QsSUFBSSxVQUFVLEdBQUcsUUFBUSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsVUFBVSxHQUFHLFFBQVEsQ0FBQztZQUMxQyxPQUFPO1FBQ1IsQ0FBQztJQUNGLENBQUM7SUFnQkQsU0FBZ0IsZ0JBQWdCLENBQUMsTUFBbUIsRUFBRSxjQUFzQixFQUFFLG1CQUE0QjtRQUN6RyxzQ0FBc0M7UUFDdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFMUQsSUFBSSwwQkFBMEIsR0FBRyxDQUFDLENBQUMsQ0FBSSwrREFBK0Q7UUFDdEcsSUFBSSw0QkFBNEIsR0FBRyxDQUFDLENBQUMsQ0FBRywwREFBMEQ7UUFFbEcsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsQ0FBTSw2REFBNkQ7UUFDN0YsSUFBSSx1QkFBdUIsR0FBRyxDQUFDLENBQUMsQ0FBSSxxRUFBcUU7UUFFekcsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsc0RBQXNEO1FBQzlHLE1BQU0sMEJBQTBCLEdBQUcsQ0FBQyxDQUFDLENBQUcsb0NBQW9DO1FBRTVFLE1BQU0sZUFBZSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFFLG1CQUFtQjtRQUN6RSxNQUFNLEdBQUcsR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7UUFFbkMsS0FBSyxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsVUFBVSxJQUFJLFVBQVUsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDO1lBQ2pFLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzRCxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTFELHdIQUF3SDtZQUN4SCxtREFBbUQ7WUFDbkQsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLGlCQUFpQixJQUFJLEtBQUssQ0FBQyxDQUFDO1lBRXhELElBQUkscUJBQXFCLEdBQUcsS0FBSyxDQUFDLENBQUcsc0RBQXNEO1lBQzNGLElBQUksc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUksMEVBQTBFO1lBQzdHLElBQUksc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUkseURBQXlEO1lBQzVGLElBQUksb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUksdURBQXVEO1lBQ3hGLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxpQkFBaUIsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3pELE1BQU0sUUFBUSxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTlHLElBQUksUUFBUSx5QkFBaUIsRUFBRSxDQUFDO29CQUMvQixvQkFBb0IsRUFBRSxDQUFDO2dCQUN4QixDQUFDO3FCQUFNLElBQUksUUFBUSw0QkFBbUIsRUFBRSxDQUFDO29CQUN4QyxzQkFBc0IsRUFBRSxDQUFDO2dCQUMxQixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsNENBQTRDO29CQUM1QyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7b0JBQzdCLHNCQUFzQixHQUFHLENBQUMsQ0FBQztvQkFDM0IsTUFBTTtnQkFDUCxDQUFDO1lBQ0YsQ0FBQztZQUVELHdDQUF3QztZQUN4QyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDNUIsU0FBUztZQUNWLENBQUM7WUFFRCxJQUFJLG9CQUFvQixHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM5QiwwQkFBMEIsRUFBRSxDQUFDO1lBQzlCLENBQUM7aUJBQU0sSUFBSSxzQkFBc0IsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDdkMsNEJBQTRCLEVBQUUsQ0FBQztZQUNoQyxDQUFDO1lBRUQsVUFBVSxDQUFDLGdCQUFnQixFQUFFLHVCQUF1QixFQUFFLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUVwRyxJQUFJLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUM1QiwrR0FBK0c7Z0JBQy9HLEVBQUU7Z0JBQ0YsVUFBVTtnQkFDVixZQUFZO2dCQUNaLEVBQUU7Z0JBQ0Ysb0NBQW9DO2dCQUNwQyxFQUFFO2dCQUNGLGVBQWU7Z0JBQ2YsZUFBZTtnQkFFZixJQUFJLENBQUMsQ0FBQyxtQkFBbUIsSUFBSSxjQUFjLEtBQUssR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0JBQ2pFLFNBQVM7Z0JBQ1YsQ0FBQztZQUNGLENBQUM7WUFFRCxNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUM7WUFDekMsSUFBSSxpQkFBaUIsSUFBSSwwQkFBMEIsRUFBRSxDQUFDO2dCQUNyRCxlQUFlLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1lBQ3RDLENBQUM7WUFFRCxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7WUFDbkMsdUJBQXVCLEdBQUcsc0JBQXNCLENBQUM7UUFDbEQsQ0FBQztRQUVELElBQUksWUFBWSxHQUFHLG1CQUFtQixDQUFDO1FBQ3ZDLElBQUksMEJBQTBCLEtBQUssNEJBQTRCLEVBQUUsQ0FBQztZQUNqRSxZQUFZLEdBQUcsQ0FBQywwQkFBMEIsR0FBRyw0QkFBNEIsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFRCxJQUFJLE9BQU8sR0FBRyxjQUFjLENBQUM7UUFFN0IsNENBQTRDO1FBQzVDLElBQUksWUFBWSxFQUFFLENBQUM7WUFDbEIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBRXpELG1EQUFtRDtZQUVuRCx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRTtnQkFDcEQsTUFBTSxvQkFBb0IsR0FBRyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzlELElBQUksb0JBQW9CLEdBQUcsWUFBWSxFQUFFLENBQUM7b0JBQ3pDLFlBQVksR0FBRyxvQkFBb0IsQ0FBQztvQkFDcEMsT0FBTyxHQUFHLGVBQWUsQ0FBQztnQkFDM0IsQ0FBQztZQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUgsdURBQXVEO1lBQ3ZELCtCQUErQjtZQUMvQixJQUFJLE9BQU8sS0FBSyxDQUFDLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZILE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDYixDQUFDO1FBQ0YsQ0FBQztRQUdELDZDQUE2QztRQUM3QyxnSkFBZ0o7UUFDaEosc0RBQXNEO1FBQ3RELDBFQUEwRTtRQUUxRSxPQUFPO1lBQ04sWUFBWSxFQUFFLFlBQVk7WUFDMUIsT0FBTyxFQUFFLE9BQU87U0FDaEIsQ0FBQztJQUNILENBQUM7SUF2SEQsNENBdUhDIn0=
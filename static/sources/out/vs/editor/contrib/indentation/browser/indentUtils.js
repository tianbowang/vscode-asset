/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generateIndent = exports.getSpaceCnt = void 0;
    function getSpaceCnt(str, tabSize) {
        let spacesCnt = 0;
        for (let i = 0; i < str.length; i++) {
            if (str.charAt(i) === '\t') {
                spacesCnt += tabSize;
            }
            else {
                spacesCnt++;
            }
        }
        return spacesCnt;
    }
    exports.getSpaceCnt = getSpaceCnt;
    function generateIndent(spacesCnt, tabSize, insertSpaces) {
        spacesCnt = spacesCnt < 0 ? 0 : spacesCnt;
        let result = '';
        if (!insertSpaces) {
            const tabsCnt = Math.floor(spacesCnt / tabSize);
            spacesCnt = spacesCnt % tabSize;
            for (let i = 0; i < tabsCnt; i++) {
                result += '\t';
            }
        }
        for (let i = 0; i < spacesCnt; i++) {
            result += ' ';
        }
        return result;
    }
    exports.generateIndent = generateIndent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZW50VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2luZGVudGF0aW9uL2Jyb3dzZXIvaW5kZW50VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHLFNBQWdCLFdBQVcsQ0FBQyxHQUFXLEVBQUUsT0FBZTtRQUN2RCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFFbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNyQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzVCLFNBQVMsSUFBSSxPQUFPLENBQUM7WUFDdEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFNBQVMsRUFBRSxDQUFDO1lBQ2IsQ0FBQztRQUNGLENBQUM7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBWkQsa0NBWUM7SUFFRCxTQUFnQixjQUFjLENBQUMsU0FBaUIsRUFBRSxPQUFlLEVBQUUsWUFBcUI7UUFDdkYsU0FBUyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTFDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbkIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDaEQsU0FBUyxHQUFHLFNBQVMsR0FBRyxPQUFPLENBQUM7WUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNsQyxNQUFNLElBQUksSUFBSSxDQUFDO1lBQ2hCLENBQUM7UUFDRixDQUFDO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDZixDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBakJELHdDQWlCQyJ9
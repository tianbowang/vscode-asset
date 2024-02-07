/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length"], function (require, exports, position_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rangeIsBeforeOrTouching = exports.addLength = exports.lengthBetweenPositions = exports.lengthOfRange = exports.rangeContainsPosition = void 0;
    function rangeContainsPosition(range, position) {
        if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
            return false;
        }
        if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
            return false;
        }
        if (position.lineNumber === range.endLineNumber && position.column >= range.endColumn) {
            return false;
        }
        return true;
    }
    exports.rangeContainsPosition = rangeContainsPosition;
    function lengthOfRange(range) {
        if (range.startLineNumber === range.endLineNumber) {
            return new length_1.LengthObj(0, range.endColumn - range.startColumn);
        }
        else {
            return new length_1.LengthObj(range.endLineNumber - range.startLineNumber, range.endColumn - 1);
        }
    }
    exports.lengthOfRange = lengthOfRange;
    function lengthBetweenPositions(position1, position2) {
        if (position1.lineNumber === position2.lineNumber) {
            return new length_1.LengthObj(0, position2.column - position1.column);
        }
        else {
            return new length_1.LengthObj(position2.lineNumber - position1.lineNumber, position2.column - 1);
        }
    }
    exports.lengthBetweenPositions = lengthBetweenPositions;
    function addLength(position, length) {
        if (length.lineCount === 0) {
            return new position_1.Position(position.lineNumber, position.column + length.columnCount);
        }
        else {
            return new position_1.Position(position.lineNumber + length.lineCount, length.columnCount + 1);
        }
    }
    exports.addLength = addLength;
    function rangeIsBeforeOrTouching(range, other) {
        return (range.endLineNumber < other.startLineNumber ||
            (range.endLineNumber === other.startLineNumber &&
                range.endColumn <= other.startColumn));
    }
    exports.rangeIsBeforeOrTouching = rangeIsBeforeOrTouching;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VVdGlscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci9tb2RlbC9yYW5nZVV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxTQUFnQixxQkFBcUIsQ0FBQyxLQUFZLEVBQUUsUUFBa0I7UUFDckUsSUFBSSxRQUFRLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxlQUFlLElBQUksUUFBUSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDOUYsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxlQUFlLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDMUYsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxhQUFhLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdkYsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBWEQsc0RBV0M7SUFFRCxTQUFnQixhQUFhLENBQUMsS0FBWTtRQUN6QyxJQUFJLEtBQUssQ0FBQyxlQUFlLEtBQUssS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ25ELE9BQU8sSUFBSSxrQkFBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5RCxDQUFDO2FBQU0sQ0FBQztZQUNQLE9BQU8sSUFBSSxrQkFBUyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7SUFDRixDQUFDO0lBTkQsc0NBTUM7SUFFRCxTQUFnQixzQkFBc0IsQ0FBQyxTQUFtQixFQUFFLFNBQW1CO1FBQzlFLElBQUksU0FBUyxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbkQsT0FBTyxJQUFJLGtCQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlELENBQUM7YUFBTSxDQUFDO1lBQ1AsT0FBTyxJQUFJLGtCQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDekYsQ0FBQztJQUNGLENBQUM7SUFORCx3REFNQztJQUVELFNBQWdCLFNBQVMsQ0FBQyxRQUFrQixFQUFFLE1BQWlCO1FBQzlELElBQUksTUFBTSxDQUFDLFNBQVMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUM1QixPQUFPLElBQUksbUJBQVEsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7YUFBTSxDQUFDO1lBQ1AsT0FBTyxJQUFJLG1CQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckYsQ0FBQztJQUNGLENBQUM7SUFORCw4QkFNQztJQUVELFNBQWdCLHVCQUF1QixDQUFDLEtBQVksRUFBRSxLQUFZO1FBQ2pFLE9BQU8sQ0FDTixLQUFLLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxlQUFlO1lBQzNDLENBQUMsS0FBSyxDQUFDLGFBQWEsS0FBSyxLQUFLLENBQUMsZUFBZTtnQkFDN0MsS0FBSyxDQUFDLFNBQVMsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQ3RDLENBQUM7SUFDSCxDQUFDO0lBTkQsMERBTUMifQ==
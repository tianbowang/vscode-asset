/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/jsonEdit"], function (require, exports, jsonEdit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLineEndOffset = exports.getLineStartOffset = exports.edit = void 0;
    function edit(content, originalPath, value, formattingOptions) {
        const edit = (0, jsonEdit_1.setProperty)(content, originalPath, value, formattingOptions)[0];
        if (edit) {
            content = content.substring(0, edit.offset) + edit.content + content.substring(edit.offset + edit.length);
        }
        return content;
    }
    exports.edit = edit;
    function getLineStartOffset(content, eol, atOffset) {
        let lineStartingOffset = atOffset;
        while (lineStartingOffset >= 0) {
            if (content.charAt(lineStartingOffset) === eol.charAt(eol.length - 1)) {
                if (eol.length === 1) {
                    return lineStartingOffset + 1;
                }
            }
            lineStartingOffset--;
            if (eol.length === 2) {
                if (lineStartingOffset >= 0 && content.charAt(lineStartingOffset) === eol.charAt(0)) {
                    return lineStartingOffset + 2;
                }
            }
        }
        return 0;
    }
    exports.getLineStartOffset = getLineStartOffset;
    function getLineEndOffset(content, eol, atOffset) {
        let lineEndOffset = atOffset;
        while (lineEndOffset >= 0) {
            if (content.charAt(lineEndOffset) === eol.charAt(eol.length - 1)) {
                if (eol.length === 1) {
                    return lineEndOffset;
                }
            }
            lineEndOffset++;
            if (eol.length === 2) {
                if (lineEndOffset >= 0 && content.charAt(lineEndOffset) === eol.charAt(1)) {
                    return lineEndOffset;
                }
            }
        }
        return content.length - 1;
    }
    exports.getLineEndOffset = getLineEndOffset;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFTeW5jL2NvbW1vbi9jb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxTQUFnQixJQUFJLENBQUMsT0FBZSxFQUFFLFlBQXNCLEVBQUUsS0FBVSxFQUFFLGlCQUFvQztRQUM3RyxNQUFNLElBQUksR0FBRyxJQUFBLHNCQUFXLEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1YsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0csQ0FBQztRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFORCxvQkFNQztJQUVELFNBQWdCLGtCQUFrQixDQUFDLE9BQWUsRUFBRSxHQUFXLEVBQUUsUUFBZ0I7UUFDaEYsSUFBSSxrQkFBa0IsR0FBRyxRQUFRLENBQUM7UUFDbEMsT0FBTyxrQkFBa0IsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNoQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDdkUsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUN0QixPQUFPLGtCQUFrQixHQUFHLENBQUMsQ0FBQztnQkFDL0IsQ0FBQztZQUNGLENBQUM7WUFDRCxrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxrQkFBa0IsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDckYsT0FBTyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7Z0JBQy9CLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQWhCRCxnREFnQkM7SUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxPQUFlLEVBQUUsR0FBVyxFQUFFLFFBQWdCO1FBQzlFLElBQUksYUFBYSxHQUFHLFFBQVEsQ0FBQztRQUM3QixPQUFPLGFBQWEsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQixJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xFLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDdEIsT0FBTyxhQUFhLENBQUM7Z0JBQ3RCLENBQUM7WUFDRixDQUFDO1lBQ0QsYUFBYSxFQUFFLENBQUM7WUFDaEIsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN0QixJQUFJLGFBQWEsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQzNFLE9BQU8sYUFBYSxDQUFDO2dCQUN0QixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFoQkQsNENBZ0JDIn0=
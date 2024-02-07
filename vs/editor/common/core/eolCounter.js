(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.countEOL = exports.StringEOL = void 0;
    var StringEOL;
    (function (StringEOL) {
        StringEOL[StringEOL["Unknown"] = 0] = "Unknown";
        StringEOL[StringEOL["Invalid"] = 3] = "Invalid";
        StringEOL[StringEOL["LF"] = 1] = "LF";
        StringEOL[StringEOL["CRLF"] = 2] = "CRLF";
    })(StringEOL || (exports.StringEOL = StringEOL = {}));
    function countEOL(text) {
        let eolCount = 0;
        let firstLineLength = 0;
        let lastLineStart = 0;
        let eol = 0 /* StringEOL.Unknown */;
        for (let i = 0, len = text.length; i < len; i++) {
            const chr = text.charCodeAt(i);
            if (chr === 13 /* CharCode.CarriageReturn */) {
                if (eolCount === 0) {
                    firstLineLength = i;
                }
                eolCount++;
                if (i + 1 < len && text.charCodeAt(i + 1) === 10 /* CharCode.LineFeed */) {
                    // \r\n... case
                    eol |= 2 /* StringEOL.CRLF */;
                    i++; // skip \n
                }
                else {
                    // \r... case
                    eol |= 3 /* StringEOL.Invalid */;
                }
                lastLineStart = i + 1;
            }
            else if (chr === 10 /* CharCode.LineFeed */) {
                // \n... case
                eol |= 1 /* StringEOL.LF */;
                if (eolCount === 0) {
                    firstLineLength = i;
                }
                eolCount++;
                lastLineStart = i + 1;
            }
        }
        if (eolCount === 0) {
            firstLineLength = text.length;
        }
        return [eolCount, firstLineLength, text.length - lastLineStart, eol];
    }
    exports.countEOL = countEOL;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW9sQ291bnRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jb3JlL2VvbENvdW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLElBQWtCLFNBS2pCO0lBTEQsV0FBa0IsU0FBUztRQUMxQiwrQ0FBVyxDQUFBO1FBQ1gsK0NBQVcsQ0FBQTtRQUNYLHFDQUFNLENBQUE7UUFDTix5Q0FBUSxDQUFBO0lBQ1QsQ0FBQyxFQUxpQixTQUFTLHlCQUFULFNBQVMsUUFLMUI7SUFFRCxTQUFnQixRQUFRLENBQUMsSUFBWTtRQUNwQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsNEJBQStCLENBQUM7UUFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2pELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0IsSUFBSSxHQUFHLHFDQUE0QixFQUFFLENBQUM7Z0JBQ3JDLElBQUksUUFBUSxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUNwQixlQUFlLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQixDQUFDO2dCQUNELFFBQVEsRUFBRSxDQUFDO2dCQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLCtCQUFzQixFQUFFLENBQUM7b0JBQ2pFLGVBQWU7b0JBQ2YsR0FBRywwQkFBa0IsQ0FBQztvQkFDdEIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVO2dCQUNoQixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsYUFBYTtvQkFDYixHQUFHLDZCQUFxQixDQUFDO2dCQUMxQixDQUFDO2dCQUNELGFBQWEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLENBQUM7aUJBQU0sSUFBSSxHQUFHLCtCQUFzQixFQUFFLENBQUM7Z0JBQ3RDLGFBQWE7Z0JBQ2IsR0FBRyx3QkFBZ0IsQ0FBQztnQkFDcEIsSUFBSSxRQUFRLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ3BCLGVBQWUsR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLENBQUM7Z0JBQ0QsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsYUFBYSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkIsQ0FBQztRQUNGLENBQUM7UUFDRCxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNwQixlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMvQixDQUFDO1FBQ0QsT0FBTyxDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQXBDRCw0QkFvQ0MifQ==
//# sourceURL=../../../vs/editor/common/core/eolCounter.js
})
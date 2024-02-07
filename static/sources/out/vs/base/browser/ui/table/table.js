/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TableError = void 0;
    class TableError extends Error {
        constructor(user, message) {
            super(`TableError [${user}] ${message}`);
        }
    }
    exports.TableError = TableError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS90YWJsZS90YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUErQmhHLE1BQWEsVUFBVyxTQUFRLEtBQUs7UUFFcEMsWUFBWSxJQUFZLEVBQUUsT0FBZTtZQUN4QyxLQUFLLENBQUMsZUFBZSxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQztRQUMxQyxDQUFDO0tBQ0Q7SUFMRCxnQ0FLQyJ9
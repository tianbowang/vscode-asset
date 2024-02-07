/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/path", "vs/base/test/common/testUtils"], function (require, exports, extpath_1, path_1, testUtils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flakySuite = exports.getRandomTestPath = void 0;
    function getRandomTestPath(tmpdir, ...segments) {
        return (0, extpath_1.randomPath)((0, path_1.join)(tmpdir, ...segments));
    }
    exports.getRandomTestPath = getRandomTestPath;
    exports.flakySuite = testUtils.flakySuite;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFV0aWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3Qvbm9kZS90ZXN0VXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLFNBQWdCLGlCQUFpQixDQUFDLE1BQWMsRUFBRSxHQUFHLFFBQWtCO1FBQ3RFLE9BQU8sSUFBQSxvQkFBVSxFQUFDLElBQUEsV0FBSSxFQUFDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUZELDhDQUVDO0lBRWEsUUFBQSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyJ9
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isWorkspaceBackupInfo = exports.isFolderBackupInfo = void 0;
    function isFolderBackupInfo(curr) {
        return curr && curr.hasOwnProperty('folderUri');
    }
    exports.isFolderBackupInfo = isFolderBackupInfo;
    function isWorkspaceBackupInfo(curr) {
        return curr && curr.hasOwnProperty('workspace');
    }
    exports.isWorkspaceBackupInfo = isWorkspaceBackupInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja3VwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9iYWNrdXAvY29tbW9uL2JhY2t1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQmhHLFNBQWdCLGtCQUFrQixDQUFDLElBQThDO1FBQ2hGLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUZELGdEQUVDO0lBRUQsU0FBZ0IscUJBQXFCLENBQUMsSUFBOEM7UUFDbkYsT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRkQsc0RBRUMifQ==
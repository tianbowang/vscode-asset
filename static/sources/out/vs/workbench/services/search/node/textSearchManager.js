/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/textfile/common/encoding", "vs/base/node/pfs", "vs/workbench/services/search/common/textSearchManager"], function (require, exports, encoding_1, pfs, textSearchManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeTextSearchManager = void 0;
    class NativeTextSearchManager extends textSearchManager_1.TextSearchManager {
        constructor(query, provider, _pfs = pfs, processType = 'searchProcess') {
            super(query, provider, {
                readdir: resource => _pfs.Promises.readdir(resource.fsPath),
                toCanonicalName: name => (0, encoding_1.toCanonicalName)(name)
            }, processType);
        }
    }
    exports.NativeTextSearchManager = NativeTextSearchManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFNlYXJjaE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zZWFyY2gvbm9kZS90ZXh0U2VhcmNoTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSx1QkFBd0IsU0FBUSxxQ0FBaUI7UUFFN0QsWUFBWSxLQUFpQixFQUFFLFFBQTRCLEVBQUUsT0FBbUIsR0FBRyxFQUFFLGNBQXdDLGVBQWU7WUFDM0ksS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUU7Z0JBQ3RCLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQzNELGVBQWUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUEsMEJBQWUsRUFBQyxJQUFJLENBQUM7YUFDOUMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNqQixDQUFDO0tBQ0Q7SUFSRCwwREFRQyJ9
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/node/zip", "vs/nls"], function (require, exports, zip_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getManifest = void 0;
    function getManifest(vsix) {
        return (0, zip_1.buffer)(vsix, 'extension/package.json')
            .then(buffer => {
            try {
                return JSON.parse(buffer.toString('utf8'));
            }
            catch (err) {
                throw new Error((0, nls_1.localize)('invalidManifest', "VSIX invalid: package.json is not a JSON file."));
            }
        });
    }
    exports.getManifest = getManifest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudFV0aWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2V4dGVuc2lvbk1hbmFnZW1lbnQvbm9kZS9leHRlbnNpb25NYW5hZ2VtZW50VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsU0FBZ0IsV0FBVyxDQUFDLElBQVk7UUFDdkMsT0FBTyxJQUFBLFlBQU0sRUFBQyxJQUFJLEVBQUUsd0JBQXdCLENBQUM7YUFDM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2QsSUFBSSxDQUFDO2dCQUNKLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGNBQVEsRUFBQyxpQkFBaUIsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDLENBQUM7WUFDaEcsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQVRELGtDQVNDIn0=
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/services/languagesRegistry"], function (require, exports, assert, languagesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertCleanState = void 0;
    /**
     * This function is called before test running and also again at the end of test running
     * and can be used to add assertions. e.g. that registries are empty, etc.
     *
     * !! This is called directly by the testing framework.
     *
     * @skipMangle
     */
    function assertCleanState() {
        // If this test fails, it is a clear indication that
        // your test or suite is leaking services (e.g. via leaking text models)
        // assert.strictEqual(LanguageService.instanceCount, 0, 'No leaking ILanguageService');
        assert.strictEqual(languagesRegistry_1.LanguagesRegistry.instanceCount, 0, 'Error: Test run should not leak in LanguagesRegistry.');
    }
    exports.assertCleanState = assertCleanState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC90ZXN0L2NvbW1vbi91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEc7Ozs7Ozs7T0FPRztJQUNILFNBQWdCLGdCQUFnQjtRQUMvQixvREFBb0Q7UUFDcEQsd0VBQXdFO1FBQ3hFLHVGQUF1RjtRQUN2RixNQUFNLENBQUMsV0FBVyxDQUFDLHFDQUFpQixDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUUsdURBQXVELENBQUMsQ0FBQztJQUNqSCxDQUFDO0lBTEQsNENBS0MifQ==
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/date", "vs/base/test/common/utils"], function (require, exports, assert_1, date_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Date', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('fromNow', () => {
            test('appendAgoLabel', () => {
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000, false), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000, true), '35 secs ago');
            });
            test('useFullTimeWords', () => {
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000, undefined, false), '35 secs');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 35000, undefined, true), '35 seconds');
            });
            test('disallowNow', () => {
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 5000), 'now');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 5000, undefined, undefined, false), 'now');
                (0, assert_1.strictEqual)((0, date_1.fromNow)(Date.now() - 5000, undefined, undefined, true), '5 secs');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvY29tbW9uL2RhdGUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU1oRyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUNsQixJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7WUFDckIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtnQkFDM0IsSUFBQSxvQkFBVyxFQUFDLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDcEQsSUFBQSxvQkFBVyxFQUFDLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQzNELElBQUEsb0JBQVcsRUFBQyxJQUFBLGNBQU8sRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQy9ELENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtnQkFDN0IsSUFBQSxvQkFBVyxFQUFDLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDcEQsSUFBQSxvQkFBVyxFQUFDLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUN0RSxJQUFBLG9CQUFXLEVBQUMsSUFBQSxjQUFPLEVBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDekUsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtnQkFDeEIsSUFBQSxvQkFBVyxFQUFDLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDL0MsSUFBQSxvQkFBVyxFQUFDLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUUsSUFBQSxvQkFBVyxFQUFDLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMvRSxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==
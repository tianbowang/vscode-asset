/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/timeTravelScheduler", "vs/platform/progress/common/progress"], function (require, exports, assert, timeTravelScheduler_1, progress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Progress', () => {
        test('multiple report calls are processed in sequence', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true, maxTaskCount: 100 }, async () => {
                const executionOrder = [];
                const timeout = (time) => {
                    return new Promise(resolve => setTimeout(resolve, time));
                };
                const executor = async (value) => {
                    executionOrder.push(`start ${value}`);
                    if (value === 1) {
                        // 1 is slowest
                        await timeout(100);
                    }
                    else if (value === 2) {
                        // 2 is also slow
                        await timeout(50);
                    }
                    else {
                        // 3 is fast
                        await timeout(10);
                    }
                    executionOrder.push(`end ${value}`);
                };
                const progress = new progress_1.AsyncProgress(executor);
                progress.report(1);
                progress.report(2);
                progress.report(3);
                await timeout(1000);
                assert.deepStrictEqual(executionOrder, [
                    'start 1',
                    'end 1',
                    'start 2',
                    'end 2',
                    'start 3',
                    'end 3',
                ]);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcHJvZ3Jlc3MvdGVzdC9jb21tb24vcHJvZ3Jlc3MudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU1oRyxLQUFLLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtRQUN0QixJQUFJLENBQUMsaURBQWlELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDbEUsTUFBTSxJQUFBLHdDQUFrQixFQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQy9FLE1BQU0sY0FBYyxHQUFhLEVBQUUsQ0FBQztnQkFDcEMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRTtvQkFDaEMsT0FBTyxJQUFJLE9BQU8sQ0FBTyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDaEUsQ0FBQyxDQUFDO2dCQUNGLE1BQU0sUUFBUSxHQUFHLEtBQUssRUFBRSxLQUFhLEVBQUUsRUFBRTtvQkFDeEMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssRUFBRSxDQUFDLENBQUM7b0JBQ3RDLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRSxDQUFDO3dCQUNqQixlQUFlO3dCQUNmLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNwQixDQUFDO3lCQUFNLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRSxDQUFDO3dCQUN4QixpQkFBaUI7d0JBQ2pCLE1BQU0sT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNuQixDQUFDO3lCQUFNLENBQUM7d0JBQ1AsWUFBWTt3QkFDWixNQUFNLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDbkIsQ0FBQztvQkFDRCxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDckMsQ0FBQyxDQUFDO2dCQUNGLE1BQU0sUUFBUSxHQUFHLElBQUksd0JBQWEsQ0FBUyxRQUFRLENBQUMsQ0FBQztnQkFFckQsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFbkIsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXBCLE1BQU0sQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFO29CQUN0QyxTQUFTO29CQUNULE9BQU87b0JBQ1AsU0FBUztvQkFDVCxPQUFPO29CQUNQLFNBQVM7b0JBQ1QsT0FBTztpQkFDUCxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==
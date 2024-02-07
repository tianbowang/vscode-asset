/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/contrib/suggest/test/browser/completionModel.test", "vs/editor/test/common/testTextModel"], function (require, exports, assert, suggestMemory_1, completionModel_test_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SuggestMemories', function () {
        let pos;
        let buffer;
        let items;
        setup(function () {
            pos = { lineNumber: 1, column: 1 };
            buffer = (0, testTextModel_1.createTextModel)('This is some text.\nthis.\nfoo: ,');
            items = [
                (0, completionModel_test_1.createSuggestItem)('foo', 0),
                (0, completionModel_test_1.createSuggestItem)('bar', 0)
            ];
        });
        teardown(() => {
            buffer.dispose();
        });
        test('AbstractMemory, select', function () {
            const mem = new class extends suggestMemory_1.Memory {
                constructor() {
                    super('first');
                }
                memorize(model, pos, item) {
                    throw new Error('Method not implemented.');
                }
                toJSON() {
                    throw new Error('Method not implemented.');
                }
                fromJSON(data) {
                    throw new Error('Method not implemented.');
                }
            };
            const item1 = (0, completionModel_test_1.createSuggestItem)('fazz', 0);
            const item2 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            const item3 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            const item4 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            item1.completion.preselect = false;
            item2.completion.preselect = true;
            item3.completion.preselect = true;
            assert.strictEqual(mem.select(buffer, pos, [item1, item2, item3, item4]), 1);
        });
        test('[No|Prefix|LRU]Memory honor selection boost', function () {
            const item1 = (0, completionModel_test_1.createSuggestItem)('fazz', 0);
            const item2 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            const item3 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            const item4 = (0, completionModel_test_1.createSuggestItem)('bazz', 0);
            item1.completion.preselect = false;
            item2.completion.preselect = true;
            item3.completion.preselect = true;
            const items = [item1, item2, item3, item4];
            assert.strictEqual(new suggestMemory_1.NoMemory().select(buffer, pos, items), 1);
            assert.strictEqual(new suggestMemory_1.LRUMemory().select(buffer, pos, items), 1);
            assert.strictEqual(new suggestMemory_1.PrefixMemory().select(buffer, pos, items), 1);
        });
        test('NoMemory', () => {
            const mem = new suggestMemory_1.NoMemory();
            assert.strictEqual(mem.select(buffer, pos, items), 0);
            assert.strictEqual(mem.select(buffer, pos, []), 0);
            mem.memorize(buffer, pos, items[0]);
            mem.memorize(buffer, pos, null);
        });
        test('LRUMemory', () => {
            pos = { lineNumber: 2, column: 6 };
            const mem = new suggestMemory_1.LRUMemory();
            mem.memorize(buffer, pos, items[1]);
            assert.strictEqual(mem.select(buffer, pos, items), 1);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 3 }, items), 0);
            mem.memorize(buffer, pos, items[0]);
            assert.strictEqual(mem.select(buffer, pos, items), 0);
            assert.strictEqual(mem.select(buffer, pos, [
                (0, completionModel_test_1.createSuggestItem)('new', 0),
                (0, completionModel_test_1.createSuggestItem)('bar', 0)
            ]), 1);
            assert.strictEqual(mem.select(buffer, pos, [
                (0, completionModel_test_1.createSuggestItem)('new1', 0),
                (0, completionModel_test_1.createSuggestItem)('new2', 0)
            ]), 0);
        });
        test('`"editor.suggestSelection": "recentlyUsed"` should be a little more sticky #78571', function () {
            const item1 = (0, completionModel_test_1.createSuggestItem)('gamma', 0);
            const item2 = (0, completionModel_test_1.createSuggestItem)('game', 0);
            items = [item1, item2];
            const mem = new suggestMemory_1.LRUMemory();
            buffer.setValue('    foo.');
            mem.memorize(buffer, { lineNumber: 1, column: 1 }, item2);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 2 }, items), 0); // leading whitespace -> ignore recent items
            mem.memorize(buffer, { lineNumber: 1, column: 9 }, item2);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 9 }, items), 1); // foo.
            buffer.setValue('    foo.g');
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 10 }, items), 1); // foo.g, 'gamma' and 'game' have the same score
            item1.score = [10, 0, 0];
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 10 }, items), 0); // foo.g, 'gamma' has higher score
        });
        test('intellisense is not showing top options first #43429', function () {
            // ensure we don't memorize for whitespace prefixes
            pos = { lineNumber: 2, column: 6 };
            const mem = new suggestMemory_1.LRUMemory();
            mem.memorize(buffer, pos, items[1]);
            assert.strictEqual(mem.select(buffer, pos, items), 1);
            assert.strictEqual(mem.select(buffer, { lineNumber: 3, column: 5 }, items), 0); // foo: |,
            assert.strictEqual(mem.select(buffer, { lineNumber: 3, column: 6 }, items), 1); // foo: ,|
        });
        test('PrefixMemory', () => {
            const mem = new suggestMemory_1.PrefixMemory();
            buffer.setValue('constructor');
            const item0 = (0, completionModel_test_1.createSuggestItem)('console', 0);
            const item1 = (0, completionModel_test_1.createSuggestItem)('const', 0);
            const item2 = (0, completionModel_test_1.createSuggestItem)('constructor', 0);
            const item3 = (0, completionModel_test_1.createSuggestItem)('constant', 0);
            const items = [item0, item1, item2, item3];
            mem.memorize(buffer, { lineNumber: 1, column: 2 }, item1); // c -> const
            mem.memorize(buffer, { lineNumber: 1, column: 3 }, item0); // co -> console
            mem.memorize(buffer, { lineNumber: 1, column: 4 }, item2); // con -> constructor
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 1 }, items), 0);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 2 }, items), 1);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 3 }, items), 0);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 4 }, items), 2);
            assert.strictEqual(mem.select(buffer, { lineNumber: 1, column: 7 }, items), 2); // find substr
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdE1lbW9yeS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zdWdnZXN0L3Rlc3QvYnJvd3Nlci9zdWdnZXN0TWVtb3J5LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFVaEcsS0FBSyxDQUFDLGlCQUFpQixFQUFFO1FBRXhCLElBQUksR0FBYyxDQUFDO1FBQ25CLElBQUksTUFBa0IsQ0FBQztRQUN2QixJQUFJLEtBQXVCLENBQUM7UUFFNUIsS0FBSyxDQUFDO1lBQ0wsR0FBRyxHQUFHLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDbkMsTUFBTSxHQUFHLElBQUEsK0JBQWUsRUFBQyxtQ0FBbUMsQ0FBQyxDQUFDO1lBQzlELEtBQUssR0FBRztnQkFDUCxJQUFBLHdDQUFpQixFQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQzNCLElBQUEsd0NBQWlCLEVBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQzthQUMzQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHdCQUF3QixFQUFFO1lBRTlCLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBTSxTQUFRLHNCQUFNO2dCQUNuQztvQkFDQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQ0QsUUFBUSxDQUFDLEtBQWlCLEVBQUUsR0FBYyxFQUFFLElBQW9CO29CQUMvRCxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQzVDLENBQUM7Z0JBQUMsTUFBTTtvQkFDUCxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Z0JBQzVDLENBQUM7Z0JBQ0QsUUFBUSxDQUFDLElBQVk7b0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztnQkFDNUMsQ0FBQzthQUNELENBQUM7WUFFRixNQUFNLEtBQUssR0FBRyxJQUFBLHdDQUFpQixFQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLEtBQUssR0FBRyxJQUFBLHdDQUFpQixFQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLEtBQUssR0FBRyxJQUFBLHdDQUFpQixFQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLEtBQUssR0FBRyxJQUFBLHdDQUFpQixFQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzQyxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDbkMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUVsQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNkNBQTZDLEVBQUU7WUFDbkQsTUFBTSxLQUFLLEdBQUcsSUFBQSx3Q0FBaUIsRUFBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0MsTUFBTSxLQUFLLEdBQUcsSUFBQSx3Q0FBaUIsRUFBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0MsTUFBTSxLQUFLLEdBQUcsSUFBQSx3Q0FBaUIsRUFBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0MsTUFBTSxLQUFLLEdBQUcsSUFBQSx3Q0FBaUIsRUFBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0MsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ25DLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUNsQyxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDbEMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUczQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksd0JBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSx5QkFBUyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLDRCQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFO1lBRXJCLE1BQU0sR0FBRyxHQUFHLElBQUksd0JBQVEsRUFBRSxDQUFDO1lBRTNCLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5ELEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtZQUV0QixHQUFHLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUVuQyxNQUFNLEdBQUcsR0FBRyxJQUFJLHlCQUFTLEVBQUUsQ0FBQztZQUM1QixHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRS9FLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RCxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtnQkFDMUMsSUFBQSx3Q0FBaUIsRUFBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQixJQUFBLHdDQUFpQixFQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDM0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRVAsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7Z0JBQzFDLElBQUEsd0NBQWlCLEVBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFDNUIsSUFBQSx3Q0FBaUIsRUFBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQzVCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNSLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG1GQUFtRixFQUFFO1lBRXpGLE1BQU0sS0FBSyxHQUFHLElBQUEsd0NBQWlCLEVBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUEsd0NBQWlCLEVBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNDLEtBQUssR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV2QixNQUFNLEdBQUcsR0FBRyxJQUFJLHlCQUFTLEVBQUUsQ0FBQztZQUM1QixNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzVCLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFMUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsNENBQTRDO1lBRTVILEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztZQUV2RixNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdEQUFnRDtZQUVqSSxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QixNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQ0FBa0M7UUFFcEgsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsc0RBQXNELEVBQUU7WUFDNUQsbURBQW1EO1lBRW5ELEdBQUcsR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ25DLE1BQU0sR0FBRyxHQUFHLElBQUkseUJBQVMsRUFBRSxDQUFDO1lBRTVCLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0RCxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQzFGLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVU7UUFDM0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtZQUV6QixNQUFNLEdBQUcsR0FBRyxJQUFJLDRCQUFZLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sS0FBSyxHQUFHLElBQUEsd0NBQWlCLEVBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sS0FBSyxHQUFHLElBQUEsd0NBQWlCLEVBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUEsd0NBQWlCLEVBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sS0FBSyxHQUFHLElBQUEsd0NBQWlCLEVBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sS0FBSyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFM0MsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWE7WUFDeEUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLGdCQUFnQjtZQUMzRSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMscUJBQXFCO1lBRWhGLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvRSxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0UsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9FLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvRSxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjO1FBQy9GLENBQUMsQ0FBQyxDQUFDO0lBRUosQ0FBQyxDQUFDLENBQUMifQ==
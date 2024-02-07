define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/contrib/dropOrPasteInto/browser/edit"], function (require, exports, assert, utils_1, edit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createTestEdit(providerId, args) {
        return {
            label: '',
            insertText: '',
            providerId,
            ...args,
        };
    }
    suite('sortEditsByYieldTo', () => {
        test('Should noop for empty edits', () => {
            const edits = [];
            assert.deepStrictEqual((0, edit_1.sortEditsByYieldTo)(edits), []);
        });
        test('Yielded to edit should get sorted after target', () => {
            const edits = [
                createTestEdit('a', { yieldTo: [{ providerId: 'b' }] }),
                createTestEdit('b'),
            ];
            assert.deepStrictEqual((0, edit_1.sortEditsByYieldTo)(edits).map(x => x.providerId), ['b', 'a']);
        });
        test('Should handle chain of yield to', () => {
            {
                const edits = [
                    createTestEdit('c', { yieldTo: [{ providerId: 'a' }] }),
                    createTestEdit('a', { yieldTo: [{ providerId: 'b' }] }),
                    createTestEdit('b'),
                ];
                assert.deepStrictEqual((0, edit_1.sortEditsByYieldTo)(edits).map(x => x.providerId), ['b', 'a', 'c']);
            }
            {
                const edits = [
                    createTestEdit('a', { yieldTo: [{ providerId: 'b' }] }),
                    createTestEdit('c', { yieldTo: [{ providerId: 'a' }] }),
                    createTestEdit('b'),
                ];
                assert.deepStrictEqual((0, edit_1.sortEditsByYieldTo)(edits).map(x => x.providerId), ['b', 'a', 'c']);
            }
        });
        test(`Should not reorder when yield to isn't used`, () => {
            const edits = [
                createTestEdit('c', { yieldTo: [{ providerId: 'x' }] }),
                createTestEdit('a', { yieldTo: [{ providerId: 'y' }] }),
                createTestEdit('b'),
            ];
            assert.deepStrictEqual((0, edit_1.sortEditsByYieldTo)(edits).map(x => x.providerId), ['c', 'a', 'b']);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdFNvcnQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvZHJvcE9yUGFzdGVJbnRvL3Rlc3QvYnJvd3Nlci9lZGl0U29ydC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLFNBQVMsY0FBYyxDQUFDLFVBQWtCLEVBQUUsSUFBd0I7UUFDbkUsT0FBTztZQUNOLEtBQUssRUFBRSxFQUFFO1lBQ1QsVUFBVSxFQUFFLEVBQUU7WUFDZCxVQUFVO1lBQ1YsR0FBRyxJQUFJO1NBQ1AsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1FBRWhDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7WUFDeEMsTUFBTSxLQUFLLEdBQWUsRUFBRSxDQUFDO1lBRTdCLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSx5QkFBa0IsRUFBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnREFBZ0QsRUFBRSxHQUFHLEVBQUU7WUFDM0QsTUFBTSxLQUFLLEdBQWU7Z0JBQ3pCLGNBQWMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZELGNBQWMsQ0FBQyxHQUFHLENBQUM7YUFDbkIsQ0FBQztZQUNGLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSx5QkFBa0IsRUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0RixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7WUFDNUMsQ0FBQztnQkFDQSxNQUFNLEtBQUssR0FBZTtvQkFDekIsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztvQkFDdkQsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztvQkFDdkQsY0FBYyxDQUFDLEdBQUcsQ0FBQztpQkFDbkIsQ0FBQztnQkFFRixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEseUJBQWtCLEVBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNGLENBQUM7WUFDRCxDQUFDO2dCQUNBLE1BQU0sS0FBSyxHQUFlO29CQUN6QixjQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO29CQUN2RCxjQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO29CQUN2RCxjQUFjLENBQUMsR0FBRyxDQUFDO2lCQUNuQixDQUFDO2dCQUVGLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSx5QkFBa0IsRUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0YsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDZDQUE2QyxFQUFFLEdBQUcsRUFBRTtZQUN4RCxNQUFNLEtBQUssR0FBZTtnQkFDekIsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDdkQsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDdkQsY0FBYyxDQUFDLEdBQUcsQ0FBQzthQUNuQixDQUFDO1lBRUYsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLHlCQUFrQixFQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzRixDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQyJ9
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/cursorColumns"], function (require, exports, assert, utils_1, cursorColumns_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CursorMove', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('nextRenderTabStop', () => {
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(0, 4), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(1, 4), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(2, 4), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(3, 4), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(4, 4), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(5, 4), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(6, 4), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(7, 4), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(8, 4), 12);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(0, 2), 2);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(1, 2), 2);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(2, 2), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(3, 2), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(4, 2), 6);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(5, 2), 6);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(6, 2), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(7, 2), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(8, 2), 10);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(0, 1), 1);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(1, 1), 2);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(2, 1), 3);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(3, 1), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(4, 1), 5);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(5, 1), 6);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(6, 1), 7);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(7, 1), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(8, 1), 9);
        });
        test('visibleColumnFromColumn', () => {
            function testVisibleColumnFromColumn(text, tabSize, column, expected) {
                assert.strictEqual(cursorColumns_1.CursorColumns.visibleColumnFromColumn(text, column, tabSize), expected);
            }
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 1, 0);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 2, 4);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 3, 8);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 4, 9);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 5, 10);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 6, 11);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 7, 12);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 8, 13);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 9, 14);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 10, 15);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 11, 16);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 12, 17);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 13, 18);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 1, 0);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 2, 4);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 3, 5);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 4, 8);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 5, 9);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 6, 10);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 7, 11);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 8, 12);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 9, 13);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 10, 14);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 11, 15);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 12, 16);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 13, 17);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 14, 18);
            testVisibleColumnFromColumn('\t  \tx\t', 4, -1, 0);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 0, 0);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 1, 0);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 2, 4);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 3, 5);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 4, 6);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 5, 8);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 6, 9);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 7, 12);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 8, 12);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 9, 12);
            testVisibleColumnFromColumn('baz', 4, 1, 0);
            testVisibleColumnFromColumn('baz', 4, 2, 1);
            testVisibleColumnFromColumn('baz', 4, 3, 2);
            testVisibleColumnFromColumn('baz', 4, 4, 3);
            testVisibleColumnFromColumn('📚az', 4, 1, 0);
            testVisibleColumnFromColumn('📚az', 4, 2, 1);
            testVisibleColumnFromColumn('📚az', 4, 3, 2);
            testVisibleColumnFromColumn('📚az', 4, 4, 3);
            testVisibleColumnFromColumn('📚az', 4, 5, 4);
        });
        test('columnFromVisibleColumn', () => {
            function testColumnFromVisibleColumn(text, tabSize, visibleColumn, expected) {
                assert.strictEqual(cursorColumns_1.CursorColumns.columnFromVisibleColumn(text, visibleColumn, tabSize), expected);
            }
            // testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 0, 1);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 1, 1);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 2, 1);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 3, 2);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 4, 2);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 5, 2);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 6, 2);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 7, 3);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 8, 3);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 9, 4);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 10, 5);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 11, 6);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 12, 7);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 13, 8);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 14, 9);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 15, 10);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 16, 11);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 17, 12);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 18, 13);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 0, 1);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 1, 1);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 2, 1);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 3, 2);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 4, 2);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 5, 3);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 6, 3);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 7, 4);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 8, 4);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 9, 5);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 10, 6);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 11, 7);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 12, 8);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 13, 9);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 14, 10);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 15, 11);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 16, 12);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 17, 13);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 18, 14);
            testColumnFromVisibleColumn('\t  \tx\t', 4, -2, 1);
            testColumnFromVisibleColumn('\t  \tx\t', 4, -1, 1);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 0, 1);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 1, 1);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 2, 1);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 3, 2);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 4, 2);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 5, 3);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 6, 4);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 7, 4);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 8, 5);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 9, 6);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 10, 6);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 11, 7);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 12, 7);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 13, 7);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 14, 7);
            testColumnFromVisibleColumn('baz', 4, 0, 1);
            testColumnFromVisibleColumn('baz', 4, 1, 2);
            testColumnFromVisibleColumn('baz', 4, 2, 3);
            testColumnFromVisibleColumn('baz', 4, 3, 4);
            testColumnFromVisibleColumn('📚az', 4, 0, 1);
            testColumnFromVisibleColumn('📚az', 4, 1, 1);
            testColumnFromVisibleColumn('📚az', 4, 2, 3);
            testColumnFromVisibleColumn('📚az', 4, 3, 4);
            testColumnFromVisibleColumn('📚az', 4, 4, 5);
        });
        test('toStatusbarColumn', () => {
            function t(text, tabSize, column, expected) {
                assert.strictEqual(cursorColumns_1.CursorColumns.toStatusbarColumn(text, column, tabSize), expected, `<<t('${text}', ${tabSize}, ${column}, ${expected})>>`);
            }
            t('    spaces', 4, 1, 1);
            t('    spaces', 4, 2, 2);
            t('    spaces', 4, 3, 3);
            t('    spaces', 4, 4, 4);
            t('    spaces', 4, 5, 5);
            t('    spaces', 4, 6, 6);
            t('    spaces', 4, 7, 7);
            t('    spaces', 4, 8, 8);
            t('    spaces', 4, 9, 9);
            t('    spaces', 4, 10, 10);
            t('    spaces', 4, 11, 11);
            t('\ttab', 4, 1, 1);
            t('\ttab', 4, 2, 5);
            t('\ttab', 4, 3, 6);
            t('\ttab', 4, 4, 7);
            t('\ttab', 4, 5, 8);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 1, 1);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 2, 2);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 3, 2);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 4, 3);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 5, 3);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 6, 4);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 7, 4);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 8, 5);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 9, 5);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 10, 6);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 11, 6);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 12, 7);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 13, 7);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 14, 8);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 15, 8);
            t('🎈🎈🎈🎈', 4, 1, 1);
            t('🎈🎈🎈🎈', 4, 2, 2);
            t('🎈🎈🎈🎈', 4, 3, 2);
            t('🎈🎈🎈🎈', 4, 4, 3);
            t('🎈🎈🎈🎈', 4, 5, 3);
            t('🎈🎈🎈🎈', 4, 6, 4);
            t('🎈🎈🎈🎈', 4, 7, 4);
            t('🎈🎈🎈🎈', 4, 8, 5);
            t('🎈🎈🎈🎈', 4, 9, 5);
            t('何何何何', 4, 1, 1);
            t('何何何何', 4, 2, 2);
            t('何何何何', 4, 3, 3);
            t('何何何何', 4, 4, 4);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yTW92ZUhlbHBlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vY29udHJvbGxlci9jdXJzb3JNb3ZlSGVscGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsS0FBSyxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7UUFFeEIsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7WUFDOUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFOUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFOUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1lBRXBDLFNBQVMsMkJBQTJCLENBQUMsSUFBWSxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUUsUUFBZ0I7Z0JBQ25HLE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzVGLENBQUM7WUFFRCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRXpELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxRCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUUxRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25ELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRW5ELDJCQUEyQixDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLDJCQUEyQixDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLDJCQUEyQixDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLDJCQUEyQixDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTVDLDJCQUEyQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdDLDJCQUEyQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdDLDJCQUEyQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdDLDJCQUEyQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdDLDJCQUEyQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtZQUVwQyxTQUFTLDJCQUEyQixDQUFDLElBQVksRUFBRSxPQUFlLEVBQUUsYUFBcUIsRUFBRSxRQUFnQjtnQkFDMUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkcsQ0FBQztZQUVELDBEQUEwRDtZQUMxRCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUV6RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxRCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxRCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRTFELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVuRCwyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FB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QUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU5QixDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QixDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QixDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV2QixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25CLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9
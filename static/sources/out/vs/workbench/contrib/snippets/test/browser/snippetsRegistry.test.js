/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/snippets/browser/snippetsService", "vs/editor/common/core/position"], function (require, exports, assert, snippetsService_1, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('getNonWhitespacePrefix', () => {
        function assertGetNonWhitespacePrefix(line, column, expected) {
            const model = {
                getLineContent: (lineNumber) => line
            };
            const actual = (0, snippetsService_1.getNonWhitespacePrefix)(model, new position_1.Position(1, column));
            assert.strictEqual(actual, expected);
        }
        test('empty line', () => {
            assertGetNonWhitespacePrefix('', 1, '');
        });
        test('singleWordLine', () => {
            assertGetNonWhitespacePrefix('something', 1, '');
            assertGetNonWhitespacePrefix('something', 2, 's');
            assertGetNonWhitespacePrefix('something', 3, 'so');
            assertGetNonWhitespacePrefix('something', 4, 'som');
            assertGetNonWhitespacePrefix('something', 5, 'some');
            assertGetNonWhitespacePrefix('something', 6, 'somet');
            assertGetNonWhitespacePrefix('something', 7, 'someth');
            assertGetNonWhitespacePrefix('something', 8, 'somethi');
            assertGetNonWhitespacePrefix('something', 9, 'somethin');
            assertGetNonWhitespacePrefix('something', 10, 'something');
        });
        test('two word line', () => {
            assertGetNonWhitespacePrefix('something interesting', 1, '');
            assertGetNonWhitespacePrefix('something interesting', 2, 's');
            assertGetNonWhitespacePrefix('something interesting', 3, 'so');
            assertGetNonWhitespacePrefix('something interesting', 4, 'som');
            assertGetNonWhitespacePrefix('something interesting', 5, 'some');
            assertGetNonWhitespacePrefix('something interesting', 6, 'somet');
            assertGetNonWhitespacePrefix('something interesting', 7, 'someth');
            assertGetNonWhitespacePrefix('something interesting', 8, 'somethi');
            assertGetNonWhitespacePrefix('something interesting', 9, 'somethin');
            assertGetNonWhitespacePrefix('something interesting', 10, 'something');
            assertGetNonWhitespacePrefix('something interesting', 11, '');
            assertGetNonWhitespacePrefix('something interesting', 12, 'i');
            assertGetNonWhitespacePrefix('something interesting', 13, 'in');
            assertGetNonWhitespacePrefix('something interesting', 14, 'int');
            assertGetNonWhitespacePrefix('something interesting', 15, 'inte');
            assertGetNonWhitespacePrefix('something interesting', 16, 'inter');
            assertGetNonWhitespacePrefix('something interesting', 17, 'intere');
            assertGetNonWhitespacePrefix('something interesting', 18, 'interes');
            assertGetNonWhitespacePrefix('something interesting', 19, 'interest');
            assertGetNonWhitespacePrefix('something interesting', 20, 'interesti');
            assertGetNonWhitespacePrefix('something interesting', 21, 'interestin');
            assertGetNonWhitespacePrefix('something interesting', 22, 'interesting');
        });
        test('many separators', () => {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FRegular_Expressions#special-white-space
            // \s matches a single white space character, including space, tab, form feed, line feed.
            // Equivalent to [ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff].
            assertGetNonWhitespacePrefix('something interesting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\tinteresting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\finteresting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\vinteresting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\u00a0interesting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\u2000interesting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\u2028interesting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\u3000interesting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\ufeffinteresting', 22, 'interesting');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldHNSZWdpc3RyeS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zbmlwcGV0cy90ZXN0L2Jyb3dzZXIvc25pcHBldHNSZWdpc3RyeS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBTWhHLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7UUFFcEMsU0FBUyw0QkFBNEIsQ0FBQyxJQUFZLEVBQUUsTUFBYyxFQUFFLFFBQWdCO1lBQ25GLE1BQU0sS0FBSyxHQUFHO2dCQUNiLGNBQWMsRUFBRSxDQUFDLFVBQWtCLEVBQUUsRUFBRSxDQUFDLElBQUk7YUFDNUMsQ0FBQztZQUNGLE1BQU0sTUFBTSxHQUFHLElBQUEsd0NBQXNCLEVBQUMsS0FBSyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0RSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7WUFDdkIsNEJBQTRCLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7WUFDM0IsNEJBQTRCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNqRCw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2xELDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbkQsNEJBQTRCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNwRCw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3JELDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEQsNEJBQTRCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2RCw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3hELDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDekQsNEJBQTRCLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM1RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO1lBQzFCLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3RCw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDOUQsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQy9ELDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRSw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakUsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2xFLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNuRSw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDcEUsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3JFLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN2RSw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUQsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQy9ELDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoRSw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakUsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xFLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNuRSw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDcEUsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3JFLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN0RSw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdkUsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3hFLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMxRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7WUFDNUIsbUxBQW1MO1lBQ25MLHlGQUF5RjtZQUN6RixrR0FBa0c7WUFFbEcsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3pFLDRCQUE0QixDQUFDLHdCQUF3QixFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUMxRSw0QkFBNEIsQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDMUUsNEJBQTRCLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzFFLDRCQUE0QixDQUFDLDRCQUE0QixFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM5RSw0QkFBNEIsQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDOUUsNEJBQTRCLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzlFLDRCQUE0QixDQUFDLDRCQUE0QixFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM5RSw0QkFBNEIsQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFL0UsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9
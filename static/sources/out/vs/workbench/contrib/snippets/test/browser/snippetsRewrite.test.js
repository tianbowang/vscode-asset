/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uuid", "vs/workbench/contrib/snippets/browser/snippetsFile"], function (require, exports, assert, uuid_1, snippetsFile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SnippetRewrite', function () {
        function assertRewrite(input, expected) {
            const actual = new snippetsFile_1.Snippet(false, ['foo'], 'foo', 'foo', 'foo', input, 'foo', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)());
            if (typeof expected === 'boolean') {
                assert.strictEqual(actual.codeSnippet, input);
            }
            else {
                assert.strictEqual(actual.codeSnippet, expected);
            }
        }
        test('bogous variable rewrite', function () {
            assertRewrite('foo', false);
            assertRewrite('hello $1 world$0', false);
            assertRewrite('$foo and $foo', '${1:foo} and ${1:foo}');
            assertRewrite('$1 and $SELECTION and $foo', '$1 and ${SELECTION} and ${2:foo}');
            assertRewrite([
                'for (var ${index} = 0; ${index} < ${array}.length; ${index}++) {',
                '\tvar ${element} = ${array}[${index}];',
                '\t$0',
                '}'
            ].join('\n'), [
                'for (var ${1:index} = 0; ${1:index} < ${2:array}.length; ${1:index}++) {',
                '\tvar ${3:element} = ${2:array}[${1:index}];',
                '\t$0',
                '\\}'
            ].join('\n'));
        });
        test('Snippet choices: unable to escape comma and pipe, #31521', function () {
            assertRewrite('console.log(${1|not\\, not, five, 5, 1   23|});', false);
        });
        test('lazy bogous variable rewrite', function () {
            const snippet = new snippetsFile_1.Snippet(false, ['fooLang'], 'foo', 'prefix', 'desc', 'This is ${bogous} because it is a ${var}', 'source', 3 /* SnippetSource.Extension */, (0, uuid_1.generateUuid)());
            assert.strictEqual(snippet.body, 'This is ${bogous} because it is a ${var}');
            assert.strictEqual(snippet.codeSnippet, 'This is ${1:bogous} because it is a ${2:var}');
            assert.strictEqual(snippet.isBogous, true);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldHNSZXdyaXRlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NuaXBwZXRzL3Rlc3QvYnJvd3Nlci9zbmlwcGV0c1Jld3JpdGUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU1oRyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7UUFFdkIsU0FBUyxhQUFhLENBQUMsS0FBYSxFQUFFLFFBQTBCO1lBQy9ELE1BQU0sTUFBTSxHQUFHLElBQUksc0JBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyw4QkFBc0IsSUFBQSxtQkFBWSxHQUFFLENBQUMsQ0FBQztZQUNsSCxJQUFJLE9BQU8sUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUNuQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDL0MsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNsRCxDQUFDO1FBQ0YsQ0FBQztRQUVELElBQUksQ0FBQyx5QkFBeUIsRUFBRTtZQUUvQixhQUFhLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVCLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV6QyxhQUFhLENBQUMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLENBQUM7WUFDeEQsYUFBYSxDQUFDLDRCQUE0QixFQUFFLGtDQUFrQyxDQUFDLENBQUM7WUFHaEYsYUFBYSxDQUNaO2dCQUNDLGtFQUFrRTtnQkFDbEUsd0NBQXdDO2dCQUN4QyxNQUFNO2dCQUNOLEdBQUc7YUFDSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDWjtnQkFDQywwRUFBMEU7Z0JBQzFFLDhDQUE4QztnQkFDOUMsTUFBTTtnQkFDTixLQUFLO2FBQ0wsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQ1osQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDBEQUEwRCxFQUFFO1lBQ2hFLGFBQWEsQ0FBQyxpREFBaUQsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw4QkFBOEIsRUFBRTtZQUNwQyxNQUFNLE9BQU8sR0FBRyxJQUFJLHNCQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsMENBQTBDLEVBQUUsUUFBUSxtQ0FBMkIsSUFBQSxtQkFBWSxHQUFFLENBQUMsQ0FBQztZQUN4SyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsMENBQTBDLENBQUMsQ0FBQztZQUM3RSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsOENBQThDLENBQUMsQ0FBQztZQUN4RixNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9
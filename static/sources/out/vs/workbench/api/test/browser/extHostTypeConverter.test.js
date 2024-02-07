/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/types", "vs/base/common/uri"], function (require, exports, assert, extHostTypes, extHostTypeConverters_1, types_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostTypeConverter', function () {
        function size(from) {
            let count = 0;
            for (const key in from) {
                if (Object.prototype.hasOwnProperty.call(from, key)) {
                    count += 1;
                }
            }
            return count;
        }
        test('MarkdownConvert - uris', function () {
            let data = extHostTypeConverters_1.MarkdownString.from('Hello');
            assert.strictEqual((0, types_1.isEmptyObject)(data.uris), true);
            assert.strictEqual(data.value, 'Hello');
            data = extHostTypeConverters_1.MarkdownString.from('Hello [link](foo)');
            assert.strictEqual(data.value, 'Hello [link](foo)');
            assert.strictEqual((0, types_1.isEmptyObject)(data.uris), true); // no scheme, no uri
            data = extHostTypeConverters_1.MarkdownString.from('Hello [link](www.noscheme.bad)');
            assert.strictEqual(data.value, 'Hello [link](www.noscheme.bad)');
            assert.strictEqual((0, types_1.isEmptyObject)(data.uris), true); // no scheme, no uri
            data = extHostTypeConverters_1.MarkdownString.from('Hello [link](foo:path)');
            assert.strictEqual(data.value, 'Hello [link](foo:path)');
            assert.strictEqual(size(data.uris), 1);
            assert.ok(!!data.uris['foo:path']);
            data = extHostTypeConverters_1.MarkdownString.from('hello@foo.bar');
            assert.strictEqual(data.value, 'hello@foo.bar');
            assert.strictEqual(size(data.uris), 1);
            // assert.ok(!!data.uris!['mailto:hello@foo.bar']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](command:me)');
            assert.strictEqual(data.value, '*hello* [click](command:me)');
            assert.strictEqual(size(data.uris), 1);
            assert.ok(!!data.uris['command:me']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.strictEqual(data.value, '*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.strictEqual(size(data.uris), 1);
            assert.ok(!!data.uris['file:///somepath/here']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.strictEqual(data.value, '*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.strictEqual(size(data.uris), 1);
            assert.ok(!!data.uris['file:///somepath/here']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](file:///somepath/here). [click](file:///somepath/here2)');
            assert.strictEqual(data.value, '*hello* [click](file:///somepath/here). [click](file:///somepath/here2)');
            assert.strictEqual(size(data.uris), 2);
            assert.ok(!!data.uris['file:///somepath/here']);
            assert.ok(!!data.uris['file:///somepath/here2']);
        });
        test('NPM script explorer running a script from the hover does not work #65561', function () {
            const data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](command:npm.runScriptFromHover?%7B%22documentUri%22%3A%7B%22%24mid%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fc%253A%2Ffoo%2Fbaz.ex%22%2C%22path%22%3A%22%2Fc%3A%2Ffoo%2Fbaz.ex%22%2C%22scheme%22%3A%22file%22%7D%2C%22script%22%3A%22dev%22%7D)');
            // assert that both uri get extracted but that the latter is only decoded once...
            assert.strictEqual(size(data.uris), 2);
            for (const value of Object.values(data.uris)) {
                if (value.scheme === 'file') {
                    assert.ok(uri_1.URI.revive(value).toString().indexOf('file:///c%3A') === 0);
                }
                else {
                    assert.strictEqual(value.scheme, 'command');
                }
            }
        });
        test('Notebook metadata is ignored when using Notebook Serializer #125716', function () {
            const d = new extHostTypes.NotebookData([]);
            d.cells.push(new extHostTypes.NotebookCellData(extHostTypes.NotebookCellKind.Code, 'hello', 'fooLang'));
            d.metadata = { custom: { foo: 'bar', bar: 123 } };
            const dto = extHostTypeConverters_1.NotebookData.from(d);
            assert.strictEqual(dto.cells.length, 1);
            assert.strictEqual(dto.cells[0].language, 'fooLang');
            assert.strictEqual(dto.cells[0].source, 'hello');
            assert.deepStrictEqual(dto.metadata, d.metadata);
        });
        test('NotebookCellOutputItem', function () {
            const item = extHostTypes.NotebookCellOutputItem.text('Hello', 'foo/bar');
            const dto = extHostTypeConverters_1.NotebookCellOutputItem.from(item);
            assert.strictEqual(dto.mime, 'foo/bar');
            assert.deepStrictEqual(Array.from(dto.valueBytes.buffer), Array.from(new TextEncoder().encode('Hello')));
            const item2 = extHostTypeConverters_1.NotebookCellOutputItem.to(dto);
            assert.strictEqual(item2.mime, item.mime);
            assert.deepStrictEqual(Array.from(item2.data), Array.from(item.data));
        });
        test('LanguageSelector', function () {
            const out = extHostTypeConverters_1.LanguageSelector.from({ language: 'bat', notebookType: 'xxx' });
            assert.ok(typeof out === 'object');
            assert.deepStrictEqual(out, {
                language: 'bat',
                notebookType: 'xxx',
                scheme: undefined,
                pattern: undefined,
                exclusive: undefined,
            });
        });
        test('JS/TS Surround With Code Actions provide bad Workspace Edits when obtained by VSCode Command API #178654', function () {
            const uri = uri_1.URI.parse('file:///foo/bar');
            const ws = new extHostTypes.WorkspaceEdit();
            ws.set(uri, [extHostTypes.SnippetTextEdit.insert(new extHostTypes.Position(1, 1), new extHostTypes.SnippetString('foo$0bar'))]);
            const dto = extHostTypeConverters_1.WorkspaceEdit.from(ws);
            const first = dto.edits[0];
            assert.strictEqual(first.textEdit.insertAsSnippet, true);
            const ws2 = extHostTypeConverters_1.WorkspaceEdit.to(dto);
            const dto2 = extHostTypeConverters_1.WorkspaceEdit.from(ws2);
            const first2 = dto2.edits[0];
            assert.strictEqual(first2.textEdit.insertAsSnippet, true);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFR5cGVDb252ZXJ0ZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L2Jyb3dzZXIvZXh0SG9zdFR5cGVDb252ZXJ0ZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVdoRyxLQUFLLENBQUMsc0JBQXNCLEVBQUU7UUFDN0IsU0FBUyxJQUFJLENBQUksSUFBc0I7WUFDdEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDeEIsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3JELEtBQUssSUFBSSxDQUFDLENBQUM7Z0JBQ1osQ0FBQztZQUNGLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRCxJQUFJLENBQUMsd0JBQXdCLEVBQUU7WUFFOUIsSUFBSSxJQUFJLEdBQUcsc0NBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHFCQUFhLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV4QyxJQUFJLEdBQUcsc0NBQWMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEscUJBQWEsRUFBQyxJQUFJLENB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
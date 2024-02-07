/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/base/common/uri", "vs/editor/contrib/snippet/browser/snippetParser", "vs/base/common/uuid"], function (require, exports, assert, snippetsFile_1, uri_1, snippetParser_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Snippets', function () {
        class TestSnippetFile extends snippetsFile_1.SnippetFile {
            constructor(filepath, snippets) {
                super(3 /* SnippetSource.Extension */, filepath, undefined, undefined, undefined, undefined);
                this.data.push(...snippets);
            }
        }
        test('SnippetFile#select', () => {
            let file = new TestSnippetFile(uri_1.URI.file('somepath/foo.code-snippets'), []);
            let bucket = [];
            file.select('', bucket);
            assert.strictEqual(bucket.length, 0);
            file = new TestSnippetFile(uri_1.URI.file('somepath/foo.code-snippets'), [
                new snippetsFile_1.Snippet(false, ['foo'], 'FooSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['foo'], 'FooSnippet2', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['bar'], 'BarSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['bar.comment'], 'BarSnippet2', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['bar.strings'], 'BarSnippet2', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['bazz', 'bazz'], 'BazzSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
            ]);
            bucket = [];
            file.select('foo', bucket);
            assert.strictEqual(bucket.length, 2);
            bucket = [];
            file.select('fo', bucket);
            assert.strictEqual(bucket.length, 0);
            bucket = [];
            file.select('bar', bucket);
            assert.strictEqual(bucket.length, 1);
            bucket = [];
            file.select('bar.comment', bucket);
            assert.strictEqual(bucket.length, 2);
            bucket = [];
            file.select('bazz', bucket);
            assert.strictEqual(bucket.length, 1);
        });
        test('SnippetFile#select - any scope', function () {
            const file = new TestSnippetFile(uri_1.URI.file('somepath/foo.code-snippets'), [
                new snippetsFile_1.Snippet(false, [], 'AnySnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
                new snippetsFile_1.Snippet(false, ['foo'], 'FooSnippet1', 'foo', '', 'snippet', 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)()),
            ]);
            const bucket = [];
            file.select('foo', bucket);
            assert.strictEqual(bucket.length, 2);
        });
        test('Snippet#needsClipboard', function () {
            function assertNeedsClipboard(body, expected) {
                const snippet = new snippetsFile_1.Snippet(false, ['foo'], 'FooSnippet1', 'foo', '', body, 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)());
                assert.strictEqual(snippet.needsClipboard, expected);
                assert.strictEqual(snippetParser_1.SnippetParser.guessNeedsClipboard(body), expected);
            }
            assertNeedsClipboard('foo$CLIPBOARD', true);
            assertNeedsClipboard('${CLIPBOARD}', true);
            assertNeedsClipboard('foo${CLIPBOARD}bar', true);
            assertNeedsClipboard('foo$clipboard', false);
            assertNeedsClipboard('foo${clipboard}', false);
            assertNeedsClipboard('baba', false);
        });
        test('Snippet#isTrivial', function () {
            function assertIsTrivial(body, expected) {
                const snippet = new snippetsFile_1.Snippet(false, ['foo'], 'FooSnippet1', 'foo', '', body, 'test', 1 /* SnippetSource.User */, (0, uuid_1.generateUuid)());
                assert.strictEqual(snippet.isTrivial, expected);
            }
            assertIsTrivial('foo', true);
            assertIsTrivial('foo$0', true);
            assertIsTrivial('foo$0bar', false);
            assertIsTrivial('foo$1', false);
            assertIsTrivial('foo$1$0', false);
            assertIsTrivial('${1:foo}', false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldEZpbGUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc25pcHBldHMvdGVzdC9icm93c2VyL3NuaXBwZXRGaWxlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFRaEcsS0FBSyxDQUFDLFVBQVUsRUFBRTtRQUVqQixNQUFNLGVBQWdCLFNBQVEsMEJBQVc7WUFDeEMsWUFBWSxRQUFhLEVBQUUsUUFBbUI7Z0JBQzdDLEtBQUssa0NBQTBCLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVUsRUFBRSxTQUFVLENBQUMsQ0FBQztnQkFDdkYsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztZQUM3QixDQUFDO1NBQ0Q7UUFFRCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1lBQy9CLElBQUksSUFBSSxHQUFHLElBQUksZUFBZSxDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzRSxJQUFJLE1BQU0sR0FBYyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXJDLElBQUksR0FBRyxJQUFJLGVBQWUsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEVBQUU7Z0JBQ2xFLElBQUksc0JBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBc0IsSUFBQSxtQkFBWSxHQUFF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
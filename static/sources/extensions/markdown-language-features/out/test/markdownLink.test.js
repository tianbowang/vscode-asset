"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const assert = require("assert");
require("mocha");
const vscode = require("vscode");
const inMemoryDocument_1 = require("../client/inMemoryDocument");
const pasteUrlProvider_1 = require("../languageFeatures/copyFiles/pasteUrlProvider");
const shared_1 = require("../languageFeatures/copyFiles/shared");
const engine_1 = require("./engine");
const cancellation_1 = require("../util/cancellation");
function makeTestDoc(contents) {
    return new inMemoryDocument_1.InMemoryDocument(vscode.Uri.file('test.md'), contents);
}
suite('createEditAddingLinksForUriList', () => {
    test('Markdown Link Pasting should occur for a valid link (end to end)', async () => {
        // createEditAddingLinksForUriList -> checkSmartPaste -> tryGetUriListSnippet -> createUriListSnippet -> createLinkSnippet
        const result = (0, shared_1.createInsertUriListEdit)(new inMemoryDocument_1.InMemoryDocument(vscode.Uri.file('test.md'), 'hello world!'), [new vscode.Range(0, 0, 0, 12)], 'https://www.microsoft.com/');
        // need to check the actual result -> snippet value
        assert.strictEqual(result?.label, 'Insert Markdown Link');
    });
    suite('validateLink', () => {
        test('Markdown pasting should occur for a valid link', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('https://www.microsoft.com/'), 'https://www.microsoft.com/');
        });
        test('Markdown pasting should occur for a valid link preceded by a new line', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('\r\nhttps://www.microsoft.com/'), 'https://www.microsoft.com/');
        });
        test('Markdown pasting should occur for a valid link followed by a new line', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('https://www.microsoft.com/\r\n'), 'https://www.microsoft.com/');
        });
        test('Markdown pasting should not occur for a valid hostname and invalid protool', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('invalid:www.microsoft.com'), undefined);
        });
        test('Markdown pasting should not occur for plain text', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('hello world!'), undefined);
        });
        test('Markdown pasting should not occur for plain text including a colon', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('hello: world!'), undefined);
        });
        test('Markdown pasting should not occur for plain text including a slashes', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('helloworld!'), undefined);
        });
        test('Markdown pasting should not occur for a link followed by text', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('https://www.microsoft.com/ hello world!'), undefined);
        });
        test('Markdown pasting should occur for a link preceded or followed by spaces', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('     https://www.microsoft.com/     '), 'https://www.microsoft.com/');
        });
        test('Markdown pasting should not occur for a link with an invalid scheme', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('hello:www.microsoft.com'), undefined);
        });
        test('Markdown pasting should not occur for multiple links being pasted', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('https://www.microsoft.com/\r\nhttps://www.microsoft.com/\r\nhttps://www.microsoft.com/\r\nhttps://www.microsoft.com/'), undefined);
        });
        test('Markdown pasting should not occur for multiple links with spaces being pasted', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('https://www.microsoft.com/    \r\nhttps://www.microsoft.com/\r\nhttps://www.microsoft.com/\r\n hello \r\nhttps://www.microsoft.com/'), undefined);
        });
        test('Markdown pasting should not occur for just a valid uri scheme', () => {
            assert.strictEqual((0, pasteUrlProvider_1.findValidUriInText)('https://'), undefined);
        });
    });
    suite('createInsertUriListEdit', () => {
        test('Should create snippet with < > when pasted link has an mismatched parentheses', () => {
            const edit = (0, shared_1.createInsertUriListEdit)(makeTestDoc(''), [new vscode.Range(0, 0, 0, 0)], 'https://www.mic(rosoft.com');
            assert.strictEqual(edit?.edits?.[0].snippet.value, '[${1:text}](<https://www.mic(rosoft.com>)');
        });
        test('Should create Markdown link snippet when pasteAsMarkdownLink is true', () => {
            const edit = (0, shared_1.createInsertUriListEdit)(makeTestDoc(''), [new vscode.Range(0, 0, 0, 0)], 'https://www.microsoft.com');
            assert.strictEqual(edit?.edits?.[0].snippet.value, '[${1:text}](https://www.microsoft.com)');
        });
        test('Should use an unencoded URI string in Markdown link when passing in an external browser link', () => {
            const edit = (0, shared_1.createInsertUriListEdit)(makeTestDoc(''), [new vscode.Range(0, 0, 0, 0)], 'https://www.microsoft.com');
            assert.strictEqual(edit?.edits?.[0].snippet.value, '[${1:text}](https://www.microsoft.com)');
        });
        test('Should not decode an encoded URI string when passing in an external browser link', () => {
            const edit = (0, shared_1.createInsertUriListEdit)(makeTestDoc(''), [new vscode.Range(0, 0, 0, 0)], 'https://www.microsoft.com/%20');
            assert.strictEqual(edit?.edits?.[0].snippet.value, '[${1:text}](https://www.microsoft.com/%20)');
        });
        test('Should not encode an unencoded URI string when passing in an external browser link', () => {
            const edit = (0, shared_1.createInsertUriListEdit)(makeTestDoc(''), [new vscode.Range(0, 0, 0, 0)], 'https://www.example.com/path?query=value&another=value#fragment');
            assert.strictEqual(edit?.edits?.[0].snippet.value, '[${1:text}](https://www.example.com/path?query=value&another=value#fragment)');
        });
    });
    suite('shouldInsertMarkdownLinkByDefault', () => {
        test('Smart should be enabled for selected plain text', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('hello world'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.SmartWithSelection, [new vscode.Range(0, 0, 0, 12)], cancellation_1.noopToken), true);
        });
        test('Smart should be enabled in headers', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('# title'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 2, 0, 2)], cancellation_1.noopToken), true);
        });
        test('Smart should be enabled in lists', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('1. text'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 3, 0, 3)], cancellation_1.noopToken), true);
        });
        test('Smart should be enabled in blockquotes', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('> text'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 3, 0, 3)], cancellation_1.noopToken), true);
        });
        test('Smart should be disabled in indented code blocks', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('    code'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 4, 0, 4)], cancellation_1.noopToken), false);
        });
        test('Smart should be disabled in fenced code blocks', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('```\r\n\r\n```'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 5, 0, 5)], cancellation_1.noopToken), false);
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('~~~\r\n\r\n~~~'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 5, 0, 5)], cancellation_1.noopToken), false);
        });
        test('Smart should be disabled in math blocks', async () => {
            const katex = (await Promise.resolve().then(() => require('@vscode/markdown-it-katex'))).default;
            const engine = (0, engine_1.createNewMarkdownEngine)();
            (await engine.getEngine(undefined)).use(katex);
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)(engine, makeTestDoc('$$\r\n\r\n$$'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 5, 0, 5)], cancellation_1.noopToken), false);
        });
        test('Smart should be disabled in link definitions', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('[ref]: http://example.com'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 4, 0, 6)], cancellation_1.noopToken), false);
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('[ref]: '), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 7, 0, 7)], cancellation_1.noopToken), false);
        });
        test('Smart should be disabled in html blocks', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('<p>\na\n</p>'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(1, 0, 1, 0)], cancellation_1.noopToken), false);
        });
        test('Smart should be disabled in Markdown links', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('[a](bcdef)'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 4, 0, 6)], cancellation_1.noopToken), false);
        });
        test('Smart should be disabled in Markdown images', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('![a](bcdef)'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 5, 0, 10)], cancellation_1.noopToken), false);
        });
        test('Smart should be disabled in inline code', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('``'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 1, 0, 1)], cancellation_1.noopToken), false);
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('``'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 0, 0, 0)], cancellation_1.noopToken), false);
        });
        test('Smart should be disabled in inline math', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('$$'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.SmartWithSelection, [new vscode.Range(0, 1, 0, 1)], cancellation_1.noopToken), false);
        });
        test('Smart should be enabled for empty selection', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('xyz'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.Smart, [new vscode.Range(0, 0, 0, 0)], cancellation_1.noopToken), true);
        });
        test('SmartWithSelection should disable for empty selection', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('xyz'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.SmartWithSelection, [new vscode.Range(0, 0, 0, 0)], cancellation_1.noopToken), false);
        });
        test('Smart should disable for selected link', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('https://www.microsoft.com'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.SmartWithSelection, [new vscode.Range(0, 0, 0, 25)], cancellation_1.noopToken), false);
        });
        test('Smart should disable for selected link with trailing whitespace', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('   https://www.microsoft.com  '), pasteUrlProvider_1.PasteUrlAsMarkdownLink.SmartWithSelection, [new vscode.Range(0, 0, 0, 30)], cancellation_1.noopToken), false);
        });
        test('Should evaluate pasteAsMarkdownLink as true for a link pasted in square brackets', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('[abc]'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.SmartWithSelection, [new vscode.Range(0, 1, 0, 4)], cancellation_1.noopToken), true);
        });
        test('Should evaluate pasteAsMarkdownLink as false for selected whitespace and new lines', async () => {
            assert.strictEqual(await (0, pasteUrlProvider_1.shouldInsertMarkdownLinkByDefault)((0, engine_1.createNewMarkdownEngine)(), makeTestDoc('   \r\n\r\n'), pasteUrlProvider_1.PasteUrlAsMarkdownLink.SmartWithSelection, [new vscode.Range(0, 0, 0, 7)], cancellation_1.noopToken), false);
        });
    });
});
//# sourceMappingURL=markdownLink.test.js.map
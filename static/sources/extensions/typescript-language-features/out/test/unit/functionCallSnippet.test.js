"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
require("mocha");
const vscode = __importStar(require("vscode"));
const snippetForFunctionCall_1 = require("../../languageFeatures/util/snippetForFunctionCall");
suite('typescript function call snippets', () => {
    test('Should use label as function name', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'abc', }, []).snippet.value, 'abc()$0');
    });
    test('Should use insertText string to override function name', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'abc', insertText: 'def' }, []).snippet.value, 'def()$0');
    });
    test('Should return insertText as-is if it is already a snippet', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'abc', insertText: new vscode.SnippetString('bla()$0') }, []).snippet.value, 'bla()$0');
    });
    test('Should return insertText as-is if it is already a snippet', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'abc', insertText: new vscode.SnippetString('bla()$0') }, []).snippet.value, 'bla()$0');
    });
    test('Should extract parameter from display parts', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'activate' }, [{ 'text': 'function', 'kind': 'keyword' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'activate', 'kind': 'text' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': 'context', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'vscode', 'kind': 'aliasName' }, { 'text': '.', 'kind': 'punctuation' }, { 'text': 'ExtensionContext', 'kind': 'interfaceName' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'void', 'kind': 'keyword' }]).snippet.value, 'activate(${1:context})$0');
    });
    test('Should extract all parameters from display parts', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'foo' }, [{ 'text': 'function', 'kind': 'keyword' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'foo', 'kind': 'functionName' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': 'a', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'string', 'kind': 'keyword' }, { 'text': ',', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'b', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'number', 'kind': 'keyword' }, { 'text': ',', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'c', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'boolean', 'kind': 'keyword' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'void', 'kind': 'keyword' }]).snippet.value, 'foo(${1:a}, ${2:b}, ${3:c})$0');
    });
    test('Should create empty placeholder at rest parameter', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'foo' }, [{ 'text': 'function', 'kind': 'keyword' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'foo', 'kind': 'functionName' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': 'a', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'string', 'kind': 'keyword' }, { 'text': ',', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '...', 'kind': 'punctuation' }, { 'text': 'rest', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'any', 'kind': 'keyword' }, { 'text': '[', 'kind': 'punctuation' }, { 'text': ']', 'kind': 'punctuation' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'void', 'kind': 'keyword' }]).snippet.value, 'foo(${1:a}$2)$0');
    });
    test('Should skip over inline function and object types when extracting parameters', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'foo' }, [{ 'text': 'function', 'kind': 'keyword' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'foo', 'kind': 'functionName' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': 'a', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': 'x', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'number', 'kind': 'keyword' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '=>', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '{', 'kind': 'punctuation' }, { 'text': '\n', 'kind': 'lineBreak' }, { 'text': '    ', 'kind': 'space' }, { 'text': 'f', 'kind': 'propertyName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '=>', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'void', 'kind': 'keyword' }, { 'text': ';', 'kind': 'punctuation' }, { 'text': '\n', 'kind': 'lineBreak' }, { 'text': '}', 'kind': 'punctuation' }, { 'text': ',', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'b', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '{', 'kind': 'punctuation' }, { 'text': '\n', 'kind': 'lineBreak' }, { 'text': '    ', 'kind': 'space' }, { 'text': 'f', 'kind': 'propertyName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '=>', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'void', 'kind': 'keyword' }, { 'text': ';', 'kind': 'punctuation' }, { 'text': '\n', 'kind': 'lineBreak' }, { 'text': '}', 'kind': 'punctuation' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'void', 'kind': 'keyword' }]).snippet.value, 'foo(${1:a}, ${2:b})$0');
    });
    test('Should skip over return type while extracting parameters', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'foo' }, [{ 'text': 'function', 'kind': 'keyword' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'foo', 'kind': 'functionName' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': 'a', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'number', 'kind': 'keyword' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '{', 'kind': 'punctuation' }, { 'text': '\n', 'kind': 'lineBreak' }, { 'text': '    ', 'kind': 'space' }, { 'text': 'f', 'kind': 'propertyName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': 'b', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'number', 'kind': 'keyword' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '=>', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'number', 'kind': 'keyword' }, { 'text': ';', 'kind': 'punctuation' }, { 'text': '\n', 'kind': 'lineBreak' }, { 'text': '}', 'kind': 'punctuation' }]).snippet.value, 'foo(${1:a})$0');
    });
    test('Should skip over prefix type while extracting parameters', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'foo' }, [{ 'text': '(', 'kind': 'punctuation' }, { 'text': 'method', 'kind': 'text' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'Array', 'kind': 'localName' }, { 'text': '<', 'kind': 'punctuation' }, { 'text': '{', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'dispose', 'kind': 'methodName' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'any', 'kind': 'keyword' }, { 'text': ';', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '}', 'kind': 'punctuation' }, { 'text': '>', 'kind': 'punctuation' }, { 'text': '.', 'kind': 'punctuation' }, { 'text': 'foo', 'kind': 'methodName' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': 'searchElement', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '{', 'kind': 'punctuation' }, { 'text': '\n', 'kind': 'lineBreak' }, { 'text': '    ', 'kind': 'space' }, { 'text': 'dispose', 'kind': 'methodName' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'any', 'kind': 'keyword' }, { 'text': ';', 'kind': 'punctuation' }, { 'text': '\n', 'kind': 'lineBreak' }, { 'text': '}', 'kind': 'punctuation' }, { 'text': ',', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'fromIndex', 'kind': 'parameterName' }, { 'text': '?', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'number', 'kind': 'keyword' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'number', 'kind': 'keyword' }]).snippet.value, 'foo(${1:searchElement}$2)$0');
    });
    test('Should complete property names', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'methoda' }, [{ 'text': '(', 'kind': 'punctuation' }, { 'text': 'method', 'kind': 'text' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'methoda', 'kind': 'propertyName' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': 'x', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'number', 'kind': 'keyword' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'void', 'kind': 'keyword' }]).snippet.value, 'methoda(${1:x})$0');
    });
    test('Should escape snippet syntax in method name', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: '$abc', }, []).snippet.value, '\\$abc()$0');
    });
    test('Should not include object key signature in completion, #66297', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'foobar', }, [{ 'text': 'function', 'kind': 'keyword' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'foobar', 'kind': 'functionName' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': 'param', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': '{', 'kind': 'punctuation' }, { 'text': '\n', 'kind': 'lineBreak' }, { 'text': '    ', 'kind': 'space' }, { 'text': '[', 'kind': 'punctuation' }, { 'text': 'key', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'string', 'kind': 'keyword' }, { 'text': ']', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'string', 'kind': 'keyword' }, { 'text': ';', 'kind': 'punctuation' }, { 'text': '\n', 'kind': 'lineBreak' }, { 'text': '}', 'kind': 'punctuation' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'void', 'kind': 'keyword' }]).snippet.value, 'foobar(${1:param})$0');
    });
    test('Should skip over this parameter', async () => {
        assert.strictEqual((0, snippetForFunctionCall_1.snippetForFunctionCall)({ label: 'foobar', }, [{ 'text': 'function', 'kind': 'keyword' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'foobar', 'kind': 'functionName' }, { 'text': '(', 'kind': 'punctuation' }, { 'text': 'this', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'string', 'kind': 'keyword' }, { 'text': ',', 'kind': 'punctuation' }, { 'text': 'param', 'kind': 'parameterName' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'string', 'kind': 'keyword' }, { 'text': ')', 'kind': 'punctuation' }, { 'text': ':', 'kind': 'punctuation' }, { 'text': ' ', 'kind': 'space' }, { 'text': 'void', 'kind': 'keyword' }]).snippet.value, 'foobar(${1:param})$0');
    });
});
//# sourceMappingURL=functionCallSnippet.test.js.map
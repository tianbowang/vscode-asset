/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/nullTokenize", "vs/editor/contrib/indentation/browser/indentation", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/browser/testCommand", "vs/editor/test/common/modes/supports/javascriptIndentationRules", "vs/editor/test/common/modes/supports/javascriptOnEnterRules", "vs/editor/test/common/testTextModel"], function (require, exports, assert, lifecycle_1, utils_1, range_1, selection_1, languages_1, language_1, languageConfigurationRegistry_1, nullTokenize_1, indentation_1, testCodeEditor_1, testCommand_1, javascriptIndentationRules_1, javascriptOnEnterRules_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testIndentationToSpacesCommand(lines, selection, tabSize, expectedLines, expectedSelection) {
        (0, testCommand_1.testCommand)(lines, null, selection, (accessor, sel) => new indentation_1.IndentationToSpacesCommand(sel, tabSize), expectedLines, expectedSelection);
    }
    function testIndentationToTabsCommand(lines, selection, tabSize, expectedLines, expectedSelection) {
        (0, testCommand_1.testCommand)(lines, null, selection, (accessor, sel) => new indentation_1.IndentationToTabsCommand(sel, tabSize), expectedLines, expectedSelection);
    }
    suite('Editor Contrib - Indentation to Spaces', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('single tabs only at start of line', function () {
            testIndentationToSpacesCommand([
                'first',
                'second line',
                'third line',
                '\tfourth line',
                '\tfifth'
            ], new selection_1.Selection(2, 3, 2, 3), 4, [
                'first',
                'second line',
                'third line',
                '    fourth line',
                '    fifth'
            ], new selection_1.Selection(2, 3, 2, 3));
        });
        test('multiple tabs at start of line', function () {
            testIndentationToSpacesCommand([
                '\t\tfirst',
                '\tsecond line',
                '\t\t\t third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5), 3, [
                '      first',
                '   second line',
                '          third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(1, 9, 1, 9));
        });
        test('multiple tabs', function () {
            testIndentationToSpacesCommand([
                '\t\tfirst\t',
                '\tsecond  \t line \t',
                '\t\t\t third line',
                ' \tfourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5), 2, [
                '    first\t',
                '  second  \t line \t',
                '       third line',
                '   fourth line',
                'fifth'
            ], new selection_1.Selection(1, 7, 1, 7));
        });
        test('empty lines', function () {
            testIndentationToSpacesCommand([
                '\t\t\t',
                '\t',
                '\t\t'
            ], new selection_1.Selection(1, 4, 1, 4), 2, [
                '      ',
                '  ',
                '    '
            ], new selection_1.Selection(1, 4, 1, 4));
        });
    });
    suite('Editor Contrib - Indentation to Tabs', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('spaces only at start of line', function () {
            testIndentationToTabsCommand([
                '    first',
                'second line',
                '    third line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 3, 2, 3), 4, [
                '\tfirst',
                'second line',
                '\tthird line',
                'fourth line',
                'fifth'
            ], new selection_1.Selection(2, 3, 2, 3));
        });
        test('multiple spaces at start of line', function () {
            testIndentationToTabsCommand([
                'first',
                '   second line',
                '          third line',
                'fourth line',
                '     fifth'
            ], new selection_1.Selection(1, 5, 1, 5), 3, [
                'first',
                '\tsecond line',
                '\t\t\t third line',
                'fourth line',
                '\t  fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('multiple spaces', function () {
            testIndentationToTabsCommand([
                '      first   ',
                '  second     line \t',
                '       third line',
                '   fourth line',
                'fifth'
            ], new selection_1.Selection(1, 8, 1, 8), 2, [
                '\t\t\tfirst   ',
                '\tsecond     line \t',
                '\t\t\t third line',
                '\t fourth line',
                'fifth'
            ], new selection_1.Selection(1, 5, 1, 5));
        });
        test('issue #45996', function () {
            testIndentationToSpacesCommand([
                '\tabc',
            ], new selection_1.Selection(1, 3, 1, 3), 4, [
                '    abc',
            ], new selection_1.Selection(1, 6, 1, 6));
        });
    });
    suite('Editor Contrib - Auto Indent On Paste', () => {
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #119225: Do not add extra leading space when pasting JSDoc', () => {
            const languageId = 'leadingSpacePaste';
            const model = (0, testTextModel_1.createTextModel)("", languageId, {});
            disposables.add(model);
            (0, testCodeEditor_1.withTestCodeEditor)(model, { autoIndent: 'full' }, (editor, viewModel, instantiationService) => {
                const languageService = instantiationService.get(language_1.ILanguageService);
                const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
                disposables.add(languageService.registerLanguage({ id: languageId }));
                disposables.add(languages_1.TokenizationRegistry.register(languageId, {
                    getInitialState: () => nullTokenize_1.NullState,
                    tokenize: () => {
                        throw new Error('not implemented');
                    },
                    tokenizeEncoded: (line, hasEOL, state) => {
                        const tokensArr = [];
                        if (line.indexOf('*') !== -1) {
                            tokensArr.push(0);
                            tokensArr.push(1 /* StandardTokenType.Comment */ << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */);
                        }
                        else {
                            tokensArr.push(0);
                            tokensArr.push(0 /* StandardTokenType.Other */ << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */);
                        }
                        const tokens = new Uint32Array(tokensArr.length);
                        for (let i = 0; i < tokens.length; i++) {
                            tokens[i] = tokensArr[i];
                        }
                        return new languages_1.EncodedTokenizationResult(tokens, state);
                    }
                }));
                disposables.add(languageConfigurationService.register(languageId, {
                    brackets: [
                        ['{', '}'],
                        ['[', ']'],
                        ['(', ')']
                    ],
                    comments: {
                        lineComment: '//',
                        blockComment: ['/*', '*/']
                    },
                    indentationRules: javascriptIndentationRules_1.javascriptIndentationRules,
                    onEnterRules: javascriptOnEnterRules_1.javascriptOnEnterRules
                }));
                const autoIndentOnPasteController = editor.registerAndInstantiateContribution(indentation_1.AutoIndentOnPaste.ID, indentation_1.AutoIndentOnPaste);
                const pasteText = [
                    '/**',
                    ' * JSDoc',
                    ' */',
                    'function a() {}'
                ].join('\n');
                viewModel.paste(pasteText, true, undefined, 'keyboard');
                autoIndentOnPasteController.trigger(new range_1.Range(1, 1, 4, 16));
                assert.strictEqual(model.getValue(), pasteText);
            });
        });
    });
    suite('Editor Contrib - Keep Indent On Paste', () => {
        let disposables;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('issue #167299: Blank line removes indent', () => {
            const languageId = 'blankLineRemovesIndent';
            const model = (0, testTextModel_1.createTextModel)("", languageId, {});
            disposables.add(model);
            (0, testCodeEditor_1.withTestCodeEditor)(model, { autoIndent: 'full' }, (editor, viewModel, instantiationService) => {
                const languageService = instantiationService.get(language_1.ILanguageService);
                const languageConfigurationService = instantiationService.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
                disposables.add(languageService.registerLanguage({ id: languageId }));
                disposables.add(languageConfigurationService.register(languageId, {
                    brackets: [
                        ['{', '}'],
                        ['[', ']'],
                        ['(', ')']
                    ],
                    indentationRules: javascriptIndentationRules_1.javascriptIndentationRules,
                    onEnterRules: javascriptOnEnterRules_1.javascriptOnEnterRules
                }));
                const autoIndentOnPasteController = editor.registerAndInstantiateContribution(indentation_1.AutoIndentOnPaste.ID, indentation_1.AutoIndentOnPaste);
                const pasteText = [
                    '',
                    'export type IncludeReference =',
                    '	| BaseReference',
                    '	| SelfReference',
                    '	| RelativeReference;',
                    '',
                    'export const enum IncludeReferenceKind {',
                    '	Base,',
                    '	Self,',
                    '	RelativeReference,',
                    '}'
                ].join('\n');
                viewModel.paste(pasteText, true, undefined, 'keyboard');
                autoIndentOnPasteController.trigger(new range_1.Range(1, 1, 11, 2));
                assert.strictEqual(model.getValue(), pasteText);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZW50YXRpb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaW5kZW50YXRpb24vdGVzdC9icm93c2VyL2luZGVudGF0aW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFtQmhHLFNBQVMsOEJBQThCLENBQUMsS0FBZSxFQUFFLFNBQW9CLEVBQUUsT0FBZSxFQUFFLGFBQXVCLEVBQUUsaUJBQTRCO1FBQ3BKLElBQUEseUJBQVcsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksd0NBQTBCLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3hJLENBQUM7SUFFRCxTQUFTLDRCQUE0QixDQUFDLEtBQWUsRUFBRSxTQUFvQixFQUFFLE9BQWUsRUFBRSxhQUF1QixFQUFFLGlCQUE0QjtRQUNsSixJQUFBLHlCQUFXLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLHNDQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUN0SSxDQUFDO0lBRUQsS0FBSyxDQUFDLHdDQUF3QyxFQUFFLEdBQUcsRUFBRTtRQUVwRCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLG1DQUFtQyxFQUFFO1lBQ3pDLDhCQUE4QixDQUM3QjtnQkFDQyxPQUFPO2dCQUNQLGFBQWE7Z0JBQ2IsWUFBWTtnQkFDWixlQUFlO2dCQUNmLFNBQVM7YUFDVCxFQUNELElBQUkscUJBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FB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
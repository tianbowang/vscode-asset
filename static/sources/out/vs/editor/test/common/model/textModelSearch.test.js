/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/wordCharacterClassifier", "vs/editor/common/core/wordHelper", "vs/editor/common/model", "vs/editor/common/model/textModelSearch", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, position_1, range_1, wordCharacterClassifier_1, wordHelper_1, model_1, textModelSearch_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // --------- Find
    suite('TextModelSearch', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const usualWordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(wordHelper_1.USUAL_WORD_SEPARATORS);
        function assertFindMatch(actual, expectedRange, expectedMatches = null) {
            assert.deepStrictEqual(actual, new model_1.FindMatch(expectedRange, expectedMatches));
        }
        function _assertFindMatches(model, searchParams, expectedMatches) {
            const actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), false, 1000);
            assert.deepStrictEqual(actual, expectedMatches, 'findMatches OK');
            // test `findNextMatch`
            let startPos = new position_1.Position(1, 1);
            let match = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, startPos, false);
            assert.deepStrictEqual(match, expectedMatches[0], `findNextMatch ${startPos}`);
            for (const expectedMatch of expectedMatches) {
                startPos = expectedMatch.range.getStartPosition();
                match = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, startPos, false);
                assert.deepStrictEqual(match, expectedMatch, `findNextMatch ${startPos}`);
            }
            // test `findPrevMatch`
            startPos = new position_1.Position(model.getLineCount(), model.getLineMaxColumn(model.getLineCount()));
            match = textModelSearch_1.TextModelSearch.findPreviousMatch(model, searchParams, startPos, false);
            assert.deepStrictEqual(match, expectedMatches[expectedMatches.length - 1], `findPrevMatch ${startPos}`);
            for (const expectedMatch of expectedMatches) {
                startPos = expectedMatch.range.getEndPosition();
                match = textModelSearch_1.TextModelSearch.findPreviousMatch(model, searchParams, startPos, false);
                assert.deepStrictEqual(match, expectedMatch, `findPrevMatch ${startPos}`);
            }
        }
        function assertFindMatches(text, searchString, isRegex, matchCase, wordSeparators, _expected) {
            const expectedRanges = _expected.map(entry => new range_1.Range(entry[0], entry[1], entry[2], entry[3]));
            const expectedMatches = expectedRanges.map(entry => new model_1.FindMatch(entry, null));
            const searchParams = new textModelSearch_1.SearchParams(searchString, isRegex, matchCase, wordSeparators);
            const model = (0, testTextModel_1.createTextModel)(text);
            _assertFindMatches(model, searchParams, expectedMatches);
            model.dispose();
            const model2 = (0, testTextModel_1.createTextModel)(text);
            model2.setEOL(1 /* EndOfLineSequence.CRLF */);
            _assertFindMatches(model2, searchParams, expectedMatches);
            model2.dispose();
        }
        const regularText = [
            'This is some foo - bar text which contains foo and bar - as in Barcelona.',
            'Now it begins a word fooBar and now it is caps Foo-isn\'t this great?',
            'And here\'s a dull line with nothing interesting in it',
            'It is also interesting if it\'s part of a word like amazingFooBar',
            'Again nothing interesting here'
        ];
        test('Simple find', () => {
            assertFindMatches(regularText.join('\n'), 'foo', false, false, null, [
                [1, 14, 1, 17],
                [1, 44, 1, 47],
                [2, 22, 2, 25],
                [2, 48, 2, 51],
                [4, 59, 4, 62]
            ]);
        });
        test('Case sensitive find', () => {
            assertFindMatches(regularText.join('\n'), 'foo', false, true, null, [
                [1, 14, 1, 17],
                [1, 44, 1, 47],
                [2, 22, 2, 25]
            ]);
        });
        test('Whole words find', () => {
            assertFindMatches(regularText.join('\n'), 'foo', false, false, wordHelper_1.USUAL_WORD_SEPARATORS, [
                [1, 14, 1, 17],
                [1, 44, 1, 47],
                [2, 48, 2, 51]
            ]);
        });
        test('/^/ find', () => {
            assertFindMatches(regularText.join('\n'), '^', true, false, null, [
                [1, 1, 1, 1],
                [2, 1, 2, 1],
                [3, 1, 3, 1],
                [4, 1, 4, 1],
                [5, 1, 5, 1]
            ]);
        });
        test('/$/ find', () => {
            assertFindMatches(regularText.join('\n'), '$', true, false, null, [
                [1, 74, 1, 74],
                [2, 69, 2, 69],
                [3, 54, 3, 54],
                [4, 65, 4, 65],
                [5, 31, 5, 31]
            ]);
        });
        test('/.*/ find', () => {
            assertFindMatches(regularText.join('\n'), '.*', true, false, null, [
                [1, 1, 1, 74],
                [2, 1, 2, 69],
                [3, 1, 3, 54],
                [4, 1, 4, 65],
                [5, 1, 5, 31]
            ]);
        });
        test('/^$/ find', () => {
            assertFindMatches([
                'This is some foo - bar text which contains foo and bar - as in Barcelona.',
                '',
                'And here\'s a dull line with nothing interesting in it',
                '',
                'Again nothing interesting here'
            ].join('\n'), '^$', true, false, null, [
                [2, 1, 2, 1],
                [4, 1, 4, 1]
            ]);
        });
        test('multiline find 1', () => {
            assertFindMatches([
                'Just some text text',
                'Just some text text',
                'some text again',
                'again some text'
            ].join('\n'), 'text\\n', true, false, null, [
                [1, 16, 2, 1],
                [2, 16, 3, 1],
            ]);
        });
        test('multiline find 2', () => {
            assertFindMatches([
                'Just some text text',
                'Just some text text',
                'some text again',
                'again some text'
            ].join('\n'), 'text\\nJust', true, false, null, [
                [1, 16, 2, 5]
            ]);
        });
        test('multiline find 3', () => {
            assertFindMatches([
                'Just some text text',
                'Just some text text',
                'some text again',
                'again some text'
            ].join('\n'), '\\nagain', true, false, null, [
                [3, 16, 4, 6]
            ]);
        });
        test('multiline find 4', () => {
            assertFindMatches([
                'Just some text text',
                'Just some text text',
                'some text again',
                'again some text'
            ].join('\n'), '.*\\nJust.*\\n', true, false, null, [
                [1, 1, 3, 1]
            ]);
        });
        test('multiline find with line beginning regex', () => {
            assertFindMatches([
                'if',
                'else',
                '',
                'if',
                'else'
            ].join('\n'), '^if\\nelse', true, false, null, [
                [1, 1, 2, 5],
                [4, 1, 5, 5]
            ]);
        });
        test('matching empty lines using boundary expression', () => {
            assertFindMatches([
                'if',
                '',
                'else',
                '  ',
                'if',
                ' ',
                'else'
            ].join('\n'), '^\\s*$\\n', true, false, null, [
                [2, 1, 3, 1],
                [4, 1, 5, 1],
                [6, 1, 7, 1]
            ]);
        });
        test('matching lines starting with A and ending with B', () => {
            assertFindMatches([
                'a if b',
                'a',
                'ab',
                'eb'
            ].join('\n'), '^a.*b$', true, false, null, [
                [1, 1, 1, 7],
                [3, 1, 3, 3]
            ]);
        });
        test('multiline find with line ending regex', () => {
            assertFindMatches([
                'if',
                'else',
                '',
                'if',
                'elseif',
                'else'
            ].join('\n'), 'if\\nelse$', true, false, null, [
                [1, 1, 2, 5],
                [5, 5, 6, 5]
            ]);
        });
        test('issue #4836 - ^.*$', () => {
            assertFindMatches([
                'Just some text text',
                '',
                'some text again',
                '',
                'again some text'
            ].join('\n'), '^.*$', true, false, null, [
                [1, 1, 1, 20],
                [2, 1, 2, 1],
                [3, 1, 3, 16],
                [4, 1, 4, 1],
                [5, 1, 5, 16],
            ]);
        });
        test('multiline find for non-regex string', () => {
            assertFindMatches([
                'Just some text text',
                'some text text',
                'some text again',
                'again some text',
                'but not some'
            ].join('\n'), 'text\nsome', false, false, null, [
                [1, 16, 2, 5],
                [2, 11, 3, 5],
            ]);
        });
        test('issue #3623: Match whole word does not work for not latin characters', () => {
            assertFindMatches([
                'я',
                'компилятор',
                'обфускация',
                ':я-я'
            ].join('\n'), 'я', false, false, wordHelper_1.USUAL_WORD_SEPARATORS, [
                [1, 1, 1, 2],
                [4, 2, 4, 3],
                [4, 4, 4, 5],
            ]);
        });
        test('issue #27459: Match whole words regression', () => {
            assertFindMatches([
                'this._register(this._textAreaInput.onKeyDown((e: IKeyboardEvent) => {',
                '	this._viewController.emitKeyDown(e);',
                '}));',
            ].join('\n'), '((e: ', false, false, wordHelper_1.USUAL_WORD_SEPARATORS, [
                [1, 45, 1, 50]
            ]);
        });
        test('issue #27594: Search results disappear', () => {
            assertFindMatches([
                'this.server.listen(0);',
            ].join('\n'), 'listen(', false, false, wordHelper_1.USUAL_WORD_SEPARATORS, [
                [1, 13, 1, 20]
            ]);
        });
        test('findNextMatch without regex', () => {
            const model = (0, testTextModel_1.createTextModel)('line line one\nline two\nthree');
            const searchParams = new textModelSearch_1.SearchParams('line', false, false, null);
            let actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(1, 6, 1, 10));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 3), false);
            assertFindMatch(actual, new range_1.Range(1, 6, 1, 10));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            model.dispose();
        });
        test('findNextMatch with beginning boundary regex', () => {
            const model = (0, testTextModel_1.createTextModel)('line one\nline two\nthree');
            const searchParams = new textModelSearch_1.SearchParams('^line', true, false, null);
            let actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 3), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            model.dispose();
        });
        test('findNextMatch with beginning boundary regex and line has repetitive beginnings', () => {
            const model = (0, testTextModel_1.createTextModel)('line line one\nline two\nthree');
            const searchParams = new textModelSearch_1.SearchParams('^line', true, false, null);
            let actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 3), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 1, 5));
            model.dispose();
        });
        test('findNextMatch with beginning boundary multiline regex and line has repetitive beginnings', () => {
            const model = (0, testTextModel_1.createTextModel)('line line one\nline two\nline three\nline four');
            const searchParams = new textModelSearch_1.SearchParams('^line.*\\nline', true, false, null);
            let actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), false);
            assertFindMatch(actual, new range_1.Range(1, 1, 2, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(3, 1, 4, 5));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(2, 1), false);
            assertFindMatch(actual, new range_1.Range(2, 1, 3, 5));
            model.dispose();
        });
        test('findNextMatch with ending boundary regex', () => {
            const model = (0, testTextModel_1.createTextModel)('one line line\ntwo line\nthree');
            const searchParams = new textModelSearch_1.SearchParams('line$', true, false, null);
            let actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), false);
            assertFindMatch(actual, new range_1.Range(1, 10, 1, 14));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 4), false);
            assertFindMatch(actual, new range_1.Range(1, 10, 1, 14));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(2, 5, 2, 9));
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, actual.range.getEndPosition(), false);
            assertFindMatch(actual, new range_1.Range(1, 10, 1, 14));
            model.dispose();
        });
        test('findMatches with capturing matches', () => {
            const model = (0, testTextModel_1.createTextModel)('one line line\ntwo line\nthree');
            const searchParams = new textModelSearch_1.SearchParams('(l(in)e)', true, false, null);
            const actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 100);
            assert.deepStrictEqual(actual, [
                new model_1.FindMatch(new range_1.Range(1, 5, 1, 9), ['line', 'line', 'in']),
                new model_1.FindMatch(new range_1.Range(1, 10, 1, 14), ['line', 'line', 'in']),
                new model_1.FindMatch(new range_1.Range(2, 5, 2, 9), ['line', 'line', 'in']),
            ]);
            model.dispose();
        });
        test('findMatches multiline with capturing matches', () => {
            const model = (0, testTextModel_1.createTextModel)('one line line\ntwo line\nthree');
            const searchParams = new textModelSearch_1.SearchParams('(l(in)e)\\n', true, false, null);
            const actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 100);
            assert.deepStrictEqual(actual, [
                new model_1.FindMatch(new range_1.Range(1, 10, 2, 1), ['line\n', 'line', 'in']),
                new model_1.FindMatch(new range_1.Range(2, 5, 3, 1), ['line\n', 'line', 'in']),
            ]);
            model.dispose();
        });
        test('findNextMatch with capturing matches', () => {
            const model = (0, testTextModel_1.createTextModel)('one line line\ntwo line\nthree');
            const searchParams = new textModelSearch_1.SearchParams('(l(in)e)', true, false, null);
            const actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            assertFindMatch(actual, new range_1.Range(1, 5, 1, 9), ['line', 'line', 'in']);
            model.dispose();
        });
        test('findNextMatch multiline with capturing matches', () => {
            const model = (0, testTextModel_1.createTextModel)('one line line\ntwo line\nthree');
            const searchParams = new textModelSearch_1.SearchParams('(l(in)e)\\n', true, false, null);
            const actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            assertFindMatch(actual, new range_1.Range(1, 10, 2, 1), ['line\n', 'line', 'in']);
            model.dispose();
        });
        test('findPreviousMatch with capturing matches', () => {
            const model = (0, testTextModel_1.createTextModel)('one line line\ntwo line\nthree');
            const searchParams = new textModelSearch_1.SearchParams('(l(in)e)', true, false, null);
            const actual = textModelSearch_1.TextModelSearch.findPreviousMatch(model, searchParams, new position_1.Position(1, 1), true);
            assertFindMatch(actual, new range_1.Range(2, 5, 2, 9), ['line', 'line', 'in']);
            model.dispose();
        });
        test('findPreviousMatch multiline with capturing matches', () => {
            const model = (0, testTextModel_1.createTextModel)('one line line\ntwo line\nthree');
            const searchParams = new textModelSearch_1.SearchParams('(l(in)e)\\n', true, false, null);
            const actual = textModelSearch_1.TextModelSearch.findPreviousMatch(model, searchParams, new position_1.Position(1, 1), true);
            assertFindMatch(actual, new range_1.Range(2, 5, 3, 1), ['line\n', 'line', 'in']);
            model.dispose();
        });
        test('\\n matches \\r\\n', () => {
            const model = (0, testTextModel_1.createTextModel)('a\r\nb\r\nc\r\nd\r\ne\r\nf\r\ng\r\nh\r\ni');
            assert.strictEqual(model.getEOL(), '\r\n');
            let searchParams = new textModelSearch_1.SearchParams('h\\n', true, false, null);
            let actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 1000)[0];
            assertFindMatch(actual, new range_1.Range(8, 1, 9, 1), ['h\n']);
            searchParams = new textModelSearch_1.SearchParams('g\\nh\\n', true, false, null);
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 1000)[0];
            assertFindMatch(actual, new range_1.Range(7, 1, 9, 1), ['g\nh\n']);
            searchParams = new textModelSearch_1.SearchParams('\\ni', true, false, null);
            actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 1000)[0];
            assertFindMatch(actual, new range_1.Range(8, 2, 9, 2), ['\ni']);
            model.dispose();
        });
        test('\\r can never be found', () => {
            const model = (0, testTextModel_1.createTextModel)('a\r\nb\r\nc\r\nd\r\ne\r\nf\r\ng\r\nh\r\ni');
            assert.strictEqual(model.getEOL(), '\r\n');
            const searchParams = new textModelSearch_1.SearchParams('\\r\\n', true, false, null);
            const actual = textModelSearch_1.TextModelSearch.findNextMatch(model, searchParams, new position_1.Position(1, 1), true);
            assert.strictEqual(actual, null);
            assert.deepStrictEqual(textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 1000), []);
            model.dispose();
        });
        function assertParseSearchResult(searchString, isRegex, matchCase, wordSeparators, expected) {
            const searchParams = new textModelSearch_1.SearchParams(searchString, isRegex, matchCase, wordSeparators);
            const actual = searchParams.parseSearchRequest();
            if (expected === null) {
                assert.ok(actual === null);
            }
            else {
                assert.deepStrictEqual(actual.regex, expected.regex);
                assert.deepStrictEqual(actual.simpleSearch, expected.simpleSearch);
                if (wordSeparators) {
                    assert.ok(actual.wordSeparators !== null);
                }
                else {
                    assert.ok(actual.wordSeparators === null);
                }
            }
        }
        test('parseSearchRequest invalid', () => {
            assertParseSearchResult('', true, true, wordHelper_1.USUAL_WORD_SEPARATORS, null);
            assertParseSearchResult('(', true, false, null, null);
        });
        test('parseSearchRequest non regex', () => {
            assertParseSearchResult('foo', false, false, null, new model_1.SearchData(/foo/giu, null, null));
            assertParseSearchResult('foo', false, false, wordHelper_1.USUAL_WORD_SEPARATORS, new model_1.SearchData(/foo/giu, usualWordSeparators, null));
            assertParseSearchResult('foo', false, true, null, new model_1.SearchData(/foo/gu, null, 'foo'));
            assertParseSearchResult('foo', false, true, wordHelper_1.USUAL_WORD_SEPARATORS, new model_1.SearchData(/foo/gu, usualWordSeparators, 'foo'));
            assertParseSearchResult('foo\\n', false, false, null, new model_1.SearchData(/foo\\n/giu, null, null));
            assertParseSearchResult('foo\\\\n', false, false, null, new model_1.SearchData(/foo\\\\n/giu, null, null));
            assertParseSearchResult('foo\\r', false, false, null, new model_1.SearchData(/foo\\r/giu, null, null));
            assertParseSearchResult('foo\\\\r', false, false, null, new model_1.SearchData(/foo\\\\r/giu, null, null));
        });
        test('parseSearchRequest regex', () => {
            assertParseSearchResult('foo', true, false, null, new model_1.SearchData(/foo/giu, null, null));
            assertParseSearchResult('foo', true, false, wordHelper_1.USUAL_WORD_SEPARATORS, new model_1.SearchData(/foo/giu, usualWordSeparators, null));
            assertParseSearchResult('foo', true, true, null, new model_1.SearchData(/foo/gu, null, null));
            assertParseSearchResult('foo', true, true, wordHelper_1.USUAL_WORD_SEPARATORS, new model_1.SearchData(/foo/gu, usualWordSeparators, null));
            assertParseSearchResult('foo\\n', true, false, null, new model_1.SearchData(/foo\n/gimu, null, null));
            assertParseSearchResult('foo\\\\n', true, false, null, new model_1.SearchData(/foo\\n/giu, null, null));
            assertParseSearchResult('foo\\r', true, false, null, new model_1.SearchData(/foo\r/gimu, null, null));
            assertParseSearchResult('foo\\\\r', true, false, null, new model_1.SearchData(/foo\\r/giu, null, null));
        });
        test('issue #53415. \W should match line break.', () => {
            assertFindMatches([
                'text',
                '180702-',
                '180703-180704'
            ].join('\n'), '\\d{6}-\\W', true, false, null, [
                [2, 1, 3, 1]
            ]);
            assertFindMatches([
                'Just some text',
                '',
                'Just'
            ].join('\n'), '\\W', true, false, null, [
                [1, 5, 1, 6],
                [1, 10, 1, 11],
                [1, 15, 2, 1],
                [2, 1, 3, 1]
            ]);
            // Line break doesn't affect the result as we always use \n as line break when doing search
            assertFindMatches([
                'Just some text',
                '',
                'Just'
            ].join('\r\n'), '\\W', true, false, null, [
                [1, 5, 1, 6],
                [1, 10, 1, 11],
                [1, 15, 2, 1],
                [2, 1, 3, 1]
            ]);
            assertFindMatches([
                'Just some text',
                '\tJust',
                'Just'
            ].join('\n'), '\\W', true, false, null, [
                [1, 5, 1, 6],
                [1, 10, 1, 11],
                [1, 15, 2, 1],
                [2, 1, 2, 2],
                [2, 6, 3, 1],
            ]);
            // line break is seen as one non-word character
            assertFindMatches([
                'Just  some text',
                '',
                'Just'
            ].join('\n'), '\\W{2}', true, false, null, [
                [1, 5, 1, 7],
                [1, 16, 3, 1]
            ]);
            // even if it's \r\n
            assertFindMatches([
                'Just  some text',
                '',
                'Just'
            ].join('\r\n'), '\\W{2}', true, false, null, [
                [1, 5, 1, 7],
                [1, 16, 3, 1]
            ]);
        });
        test('Simple find using unicode escape sequences', () => {
            assertFindMatches(regularText.join('\n'), '\\u{0066}\\u006f\\u006F', true, false, null, [
                [1, 14, 1, 17],
                [1, 44, 1, 47],
                [2, 22, 2, 25],
                [2, 48, 2, 51],
                [4, 59, 4, 62]
            ]);
        });
        test('isMultilineRegexSource', () => {
            assert(!(0, textModelSearch_1.isMultilineRegexSource)('foo'));
            assert(!(0, textModelSearch_1.isMultilineRegexSource)(''));
            assert(!(0, textModelSearch_1.isMultilineRegexSource)('foo\\sbar'));
            assert(!(0, textModelSearch_1.isMultilineRegexSource)('\\\\notnewline'));
            assert((0, textModelSearch_1.isMultilineRegexSource)('foo\\nbar'));
            assert((0, textModelSearch_1.isMultilineRegexSource)('foo\\nbar\\s'));
            assert((0, textModelSearch_1.isMultilineRegexSource)('foo\\r\\n'));
            assert((0, textModelSearch_1.isMultilineRegexSource)('\\n'));
            assert((0, textModelSearch_1.isMultilineRegexSource)('foo\\W'));
            assert((0, textModelSearch_1.isMultilineRegexSource)('foo\n'));
            assert((0, textModelSearch_1.isMultilineRegexSource)('foo\r\n'));
        });
        test('issue #74715. \\d* finds empty string and stops searching.', () => {
            const model = (0, testTextModel_1.createTextModel)('10.243.30.10');
            const searchParams = new textModelSearch_1.SearchParams('\\d*', true, false, null);
            const actual = textModelSearch_1.TextModelSearch.findMatches(model, searchParams, model.getFullModelRange(), true, 100);
            assert.deepStrictEqual(actual, [
                new model_1.FindMatch(new range_1.Range(1, 1, 1, 3), ['10']),
                new model_1.FindMatch(new range_1.Range(1, 3, 1, 3), ['']),
                new model_1.FindMatch(new range_1.Range(1, 4, 1, 7), ['243']),
                new model_1.FindMatch(new range_1.Range(1, 7, 1, 7), ['']),
                new model_1.FindMatch(new range_1.Range(1, 8, 1, 10), ['30']),
                new model_1.FindMatch(new range_1.Range(1, 10, 1, 10), ['']),
                new model_1.FindMatch(new range_1.Range(1, 11, 1, 13), ['10'])
            ]);
            model.dispose();
        });
        test('issue #100134. Zero-length matches should properly step over surrogate pairs', () => {
            // 1[Laptop]1 - there shoud be no matches inside of [Laptop] emoji
            assertFindMatches('1\uD83D\uDCBB1', '()', true, false, null, [
                [1, 1, 1, 1],
                [1, 2, 1, 2],
                [1, 4, 1, 4],
                [1, 5, 1, 5],
            ]);
            // 1[Hacker Cat]1 = 1[Cat Face][ZWJ][Laptop]1 - there shoud be matches between emoji and ZWJ
            // there shoud be no matches inside of [Cat Face] and [Laptop] emoji
            assertFindMatches('1\uD83D\uDC31\u200D\uD83D\uDCBB1', '()', true, false, null, [
                [1, 1, 1, 1],
                [1, 2, 1, 2],
                [1, 4, 1, 4],
                [1, 5, 1, 5],
                [1, 7, 1, 7],
                [1, 8, 1, 8]
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsU2VhcmNoLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9tb2RlbC90ZXh0TW9kZWxTZWFyY2gudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWFoRyxpQkFBaUI7SUFDakIsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtRQUU3QixJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsTUFBTSxtQkFBbUIsR0FBRyxJQUFBLGlEQUF1QixFQUFDLGtDQUFxQixDQUFDLENBQUM7UUFFM0UsU0FBUyxlQUFlLENBQUMsTUFBd0IsRUFBRSxhQUFvQixFQUFFLGtCQUFtQyxJQUFJO1lBQy9HLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksaUJBQVMsQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxLQUFnQixFQUFFLFlBQTBCLEVBQUUsZUFBNEI7WUFDckcsTUFBTSxNQUFNLEdBQUcsaUNBQWUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFFbEUsdUJBQXVCO1lBQ3ZCLElBQUksUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxLQUFLLEdBQUcsaUNBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEYsTUFBTSxDQUFDLGVB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QUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0MsTUFBTSxHQUFHLGlDQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsTUFBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFaEQsTUFBTSxHQUFHLGlDQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxtQkFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2RixlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFaEQsTUFBTSxHQUFHLGlDQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsTUFBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0MsTUFBTSxHQUFHLGlDQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsTUFBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDZD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
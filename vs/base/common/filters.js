(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/map", "vs/base/common/naturalLanguage/korean", "vs/base/common/strings"], function (require, exports, map_1, korean_1, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fuzzyScoreGraceful = exports.fuzzyScoreGracefulAggressive = exports.fuzzyScore = exports.FuzzyScoreOptions = exports.FuzzyScore = exports.isPatternInWord = exports.createMatches = exports.anyScore = exports.matchesFuzzy2 = exports.matchesFuzzy = exports.matchesWords = exports.matchesCamelCase = exports.isUpper = exports.matchesSubString = exports.matchesContiguousSubString = exports.matchesPrefix = exports.matchesStrictPrefix = exports.or = void 0;
    // Combined filters
    /**
     * @returns A filter which combines the provided set
     * of filters with an or. The *first* filters that
     * matches defined the return value of the returned
     * filter.
     */
    function or(...filter) {
        return function (word, wordToMatchAgainst) {
            for (let i = 0, len = filter.length; i < len; i++) {
                const match = filter[i](word, wordToMatchAgainst);
                if (match) {
                    return match;
                }
            }
            return null;
        };
    }
    exports.or = or;
    // Prefix
    exports.matchesStrictPrefix = _matchesPrefix.bind(undefined, false);
    exports.matchesPrefix = _matchesPrefix.bind(undefined, true);
    function _matchesPrefix(ignoreCase, word, wordToMatchAgainst) {
        if (!wordToMatchAgainst || wordToMatchAgainst.length < word.length) {
            return null;
        }
        let matches;
        if (ignoreCase) {
            matches = strings.startsWithIgnoreCase(wordToMatchAgainst, word);
        }
        else {
            matches = wordToMatchAgainst.indexOf(word) === 0;
        }
        if (!matches) {
            return null;
        }
        return word.length > 0 ? [{ start: 0, end: word.length }] : [];
    }
    // Contiguous Substring
    function matchesContiguousSubString(word, wordToMatchAgainst) {
        const index = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
        if (index === -1) {
            return null;
        }
        return [{ start: index, end: index + word.length }];
    }
    exports.matchesContiguousSubString = matchesContiguousSubString;
    // Substring
    function matchesSubString(word, wordToMatchAgainst) {
        return _matchesSubString(word.toLowerCase(), wordToMatchAgainst.toLowerCase(), 0, 0);
    }
    exports.matchesSubString = matchesSubString;
    function _matchesSubString(word, wordToMatchAgainst, i, j) {
        if (i === word.length) {
            return [];
        }
        else if (j === wordToMatchAgainst.length) {
            return null;
        }
        else {
            if (word[i] === wordToMatchAgainst[j]) {
                let result = null;
                if (result = _matchesSubString(word, wordToMatchAgainst, i + 1, j + 1)) {
                    return join({ start: j, end: j + 1 }, result);
                }
                return null;
            }
            return _matchesSubString(word, wordToMatchAgainst, i, j + 1);
        }
    }
    // CamelCase
    function isLower(code) {
        return 97 /* CharCode.a */ <= code && code <= 122 /* CharCode.z */;
    }
    function isUpper(code) {
        return 65 /* CharCode.A */ <= code && code <= 90 /* CharCode.Z */;
    }
    exports.isUpper = isUpper;
    function isNumber(code) {
        return 48 /* CharCode.Digit0 */ <= code && code <= 57 /* CharCode.Digit9 */;
    }
    function isWhitespace(code) {
        return (code === 32 /* CharCode.Space */
            || code === 9 /* CharCode.Tab */
            || code === 10 /* CharCode.LineFeed */
            || code === 13 /* CharCode.CarriageReturn */);
    }
    const wordSeparators = new Set();
    // These are chosen as natural word separators based on writen text.
    // It is a subset of the word separators used by the monaco editor.
    '()[]{}<>`\'"-/;:,.?!'
        .split('')
        .forEach(s => wordSeparators.add(s.charCodeAt(0)));
    function isWordSeparator(code) {
        return isWhitespace(code) || wordSeparators.has(code);
    }
    function charactersMatch(codeA, codeB) {
        return (codeA === codeB) || (isWordSeparator(codeA) && isWordSeparator(codeB));
    }
    const alternateCharsCache = new Map();
    /**
     * Gets alternative codes to the character code passed in. This comes in the
     * form of an array of character codes, all of which must match _in order_ to
     * successfully match.
     *
     * @param code The character code to check.
     */
    function getAlternateCodes(code) {
        if (alternateCharsCache.has(code)) {
            return alternateCharsCache.get(code);
        }
        // NOTE: This function is written in such a way that it can be extended in
        // the future, but right now the return type takes into account it's only
        // supported by a single "alt codes provider".
        // `ArrayLike<ArrayLike<number>>` is a more appropriate type if changed.
        let result;
        const codes = (0, korean_1.getKoreanAltChars)(code);
        if (codes) {
            result = codes;
        }
        alternateCharsCache.set(code, result);
        return result;
    }
    function isAlphanumeric(code) {
        return isLower(code) || isUpper(code) || isNumber(code);
    }
    function join(head, tail) {
        if (tail.length === 0) {
            tail = [head];
        }
        else if (head.end === tail[0].start) {
            tail[0].start = head.start;
        }
        else {
            tail.unshift(head);
        }
        return tail;
    }
    function nextAnchor(camelCaseWord, start) {
        for (let i = start; i < camelCaseWord.length; i++) {
            const c = camelCaseWord.charCodeAt(i);
            if (isUpper(c) || isNumber(c) || (i > 0 && !isAlphanumeric(camelCaseWord.charCodeAt(i - 1)))) {
                return i;
            }
        }
        return camelCaseWord.length;
    }
    function _matchesCamelCase(word, camelCaseWord, i, j) {
        if (i === word.length) {
            return [];
        }
        else if (j === camelCaseWord.length) {
            return null;
        }
        else if (word[i] !== camelCaseWord[j].toLowerCase()) {
            return null;
        }
        else {
            let result = null;
            let nextUpperIndex = j + 1;
            result = _matchesCamelCase(word, camelCaseWord, i + 1, j + 1);
            while (!result && (nextUpperIndex = nextAnchor(camelCaseWord, nextUpperIndex)) < camelCaseWord.length) {
                result = _matchesCamelCase(word, camelCaseWord, i + 1, nextUpperIndex);
                nextUpperIndex++;
            }
            return result === null ? null : join({ start: j, end: j + 1 }, result);
        }
    }
    // Heuristic to avoid computing camel case matcher for words that don't
    // look like camelCaseWords.
    function analyzeCamelCaseWord(word) {
        let upper = 0, lower = 0, alpha = 0, numeric = 0, code = 0;
        for (let i = 0; i < word.length; i++) {
            code = word.charCodeAt(i);
            if (isUpper(code)) {
                upper++;
            }
            if (isLower(code)) {
                lower++;
            }
            if (isAlphanumeric(code)) {
                alpha++;
            }
            if (isNumber(code)) {
                numeric++;
            }
        }
        const upperPercent = upper / word.length;
        const lowerPercent = lower / word.length;
        const alphaPercent = alpha / word.length;
        const numericPercent = numeric / word.length;
        return { upperPercent, lowerPercent, alphaPercent, numericPercent };
    }
    function isUpperCaseWord(analysis) {
        const { upperPercent, lowerPercent } = analysis;
        return lowerPercent === 0 && upperPercent > 0.6;
    }
    function isCamelCaseWord(analysis) {
        const { upperPercent, lowerPercent, alphaPercent, numericPercent } = analysis;
        return lowerPercent > 0.2 && upperPercent < 0.8 && alphaPercent > 0.6 && numericPercent < 0.2;
    }
    // Heuristic to avoid computing camel case matcher for words that don't
    // look like camel case patterns.
    function isCamelCasePattern(word) {
        let upper = 0, lower = 0, code = 0, whitespace = 0;
        for (let i = 0; i < word.length; i++) {
            code = word.charCodeAt(i);
            if (isUpper(code)) {
                upper++;
            }
            if (isLower(code)) {
                lower++;
            }
            if (isWhitespace(code)) {
                whitespace++;
            }
        }
        if ((upper === 0 || lower === 0) && whitespace === 0) {
            return word.length <= 30;
        }
        else {
            return upper <= 5;
        }
    }
    function matchesCamelCase(word, camelCaseWord) {
        if (!camelCaseWord) {
            return null;
        }
        camelCaseWord = camelCaseWord.trim();
        if (camelCaseWord.length === 0) {
            return null;
        }
        if (!isCamelCasePattern(word)) {
            return null;
        }
        if (camelCaseWord.length > 60) {
            return null;
        }
        const analysis = analyzeCamelCaseWord(camelCaseWord);
        if (!isCamelCaseWord(analysis)) {
            if (!isUpperCaseWord(analysis)) {
                return null;
            }
            camelCaseWord = camelCaseWord.toLowerCase();
        }
        let result = null;
        let i = 0;
        word = word.toLowerCase();
        while (i < camelCaseWord.length && (result = _matchesCamelCase(word, camelCaseWord, 0, i)) === null) {
            i = nextAnchor(camelCaseWord, i + 1);
        }
        return result;
    }
    exports.matchesCamelCase = matchesCamelCase;
    // Matches beginning of words supporting non-ASCII languages
    // If `contiguous` is true then matches word with beginnings of the words in the target. E.g. "pul" will match "Git: Pull"
    // Otherwise also matches sub string of the word with beginnings of the words in the target. E.g. "gp" or "g p" will match "Git: Pull"
    // Useful in cases where the target is words (e.g. command labels)
    function matchesWords(word, target, contiguous = false) {
        if (!target || target.length === 0) {
            return null;
        }
        let result = null;
        let targetIndex = 0;
        word = word.toLowerCase();
        target = target.toLowerCase();
        while (targetIndex < target.length) {
            result = _matchesWords(word, target, 0, targetIndex, contiguous);
            if (result !== null) {
                break;
            }
            targetIndex = nextWord(target, targetIndex + 1);
        }
        return result;
    }
    exports.matchesWords = matchesWords;
    function _matchesWords(word, target, wordIndex, targetIndex, contiguous) {
        let targetIndexOffset = 0;
        if (wordIndex === word.length) {
            return [];
        }
        else if (targetIndex === target.length) {
            return null;
        }
        else if (!charactersMatch(word.charCodeAt(wordIndex), target.charCodeAt(targetIndex))) {
            // Verify alternate characters before exiting
            const altChars = getAlternateCodes(word.charCodeAt(wordIndex));
            if (!altChars) {
                return null;
            }
            for (let k = 0; k < altChars.length; k++) {
                if (!charactersMatch(altChars[k], target.charCodeAt(targetIndex + k))) {
                    return null;
                }
            }
            targetIndexOffset += altChars.length - 1;
        }
        let result = null;
        let nextWordIndex = targetIndex + targetIndexOffset + 1;
        result = _matchesWords(word, target, wordIndex + 1, nextWordIndex, contiguous);
        if (!contiguous) {
            while (!result && (nextWordIndex = nextWord(target, nextWordIndex)) < target.length) {
                result = _matchesWords(word, target, wordIndex + 1, nextWordIndex, contiguous);
                nextWordIndex++;
            }
        }
        if (!result) {
            return null;
        }
        // If the characters don't exactly match, then they must be word separators (see charactersMatch(...)).
        // We don't want to include this in the matches but we don't want to throw the target out all together so we return `result`.
        if (word.charCodeAt(wordIndex) !== target.charCodeAt(targetIndex)) {
            // Verify alternate characters before exiting
            const altChars = getAlternateCodes(word.charCodeAt(wordIndex));
            if (!altChars) {
                return result;
            }
            for (let k = 0; k < altChars.length; k++) {
                if (altChars[k] !== target.charCodeAt(targetIndex + k)) {
                    return result;
                }
            }
        }
        return join({ start: targetIndex, end: targetIndex + targetIndexOffset + 1 }, result);
    }
    function nextWord(word, start) {
        for (let i = start; i < word.length; i++) {
            if (isWordSeparator(word.charCodeAt(i)) ||
                (i > 0 && isWordSeparator(word.charCodeAt(i - 1)))) {
                return i;
            }
        }
        return word.length;
    }
    // Fuzzy
    const fuzzyContiguousFilter = or(exports.matchesPrefix, matchesCamelCase, matchesContiguousSubString);
    const fuzzySeparateFilter = or(exports.matchesPrefix, matchesCamelCase, matchesSubString);
    const fuzzyRegExpCache = new map_1.LRUCache(10000); // bounded to 10000 elements
    function matchesFuzzy(word, wordToMatchAgainst, enableSeparateSubstringMatching = false) {
        if (typeof word !== 'string' || typeof wordToMatchAgainst !== 'string') {
            return null; // return early for invalid input
        }
        // Form RegExp for wildcard matches
        let regexp = fuzzyRegExpCache.get(word);
        if (!regexp) {
            regexp = new RegExp(strings.convertSimple2RegExpPattern(word), 'i');
            fuzzyRegExpCache.set(word, regexp);
        }
        // RegExp Filter
        const match = regexp.exec(wordToMatchAgainst);
        if (match) {
            return [{ start: match.index, end: match.index + match[0].length }];
        }
        // Default Filter
        return enableSeparateSubstringMatching ? fuzzySeparateFilter(word, wordToMatchAgainst) : fuzzyContiguousFilter(word, wordToMatchAgainst);
    }
    exports.matchesFuzzy = matchesFuzzy;
    /**
     * Match pattern against word in a fuzzy way. As in IntelliSense and faster and more
     * powerful than `matchesFuzzy`
     */
    function matchesFuzzy2(pattern, word) {
        const score = fuzzyScore(pattern, pattern.toLowerCase(), 0, word, word.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
        return score ? createMatches(score) : null;
    }
    exports.matchesFuzzy2 = matchesFuzzy2;
    function anyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos) {
        const max = Math.min(13, pattern.length);
        for (; patternPos < max; patternPos++) {
            const result = fuzzyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos, { firstMatchCanBeWeak: true, boostFullMatch: true });
            if (result) {
                return result;
            }
        }
        return [0, wordPos];
    }
    exports.anyScore = anyScore;
    //#region --- fuzzyScore ---
    function createMatches(score) {
        if (typeof score === 'undefined') {
            return [];
        }
        const res = [];
        const wordPos = score[1];
        for (let i = score.length - 1; i > 1; i--) {
            const pos = score[i] + wordPos;
            const last = res[res.length - 1];
            if (last && last.end === pos) {
                last.end = pos + 1;
            }
            else {
                res.push({ start: pos, end: pos + 1 });
            }
        }
        return res;
    }
    exports.createMatches = createMatches;
    const _maxLen = 128;
    function initTable() {
        const table = [];
        const row = [];
        for (let i = 0; i <= _maxLen; i++) {
            row[i] = 0;
        }
        for (let i = 0; i <= _maxLen; i++) {
            table.push(row.slice(0));
        }
        return table;
    }
    function initArr(maxLen) {
        const row = [];
        for (let i = 0; i <= maxLen; i++) {
            row[i] = 0;
        }
        return row;
    }
    const _minWordMatchPos = initArr(2 * _maxLen); // min word position for a certain pattern position
    const _maxWordMatchPos = initArr(2 * _maxLen); // max word position for a certain pattern position
    const _diag = initTable(); // the length of a contiguous diagonal match
    const _table = initTable();
    const _arrows = initTable();
    const _debug = false;
    function printTable(table, pattern, patternLen, word, wordLen) {
        function pad(s, n, pad = ' ') {
            while (s.length < n) {
                s = pad + s;
            }
            return s;
        }
        let ret = ` |   |${word.split('').map(c => pad(c, 3)).join('|')}\n`;
        for (let i = 0; i <= patternLen; i++) {
            if (i === 0) {
                ret += ' |';
            }
            else {
                ret += `${pattern[i - 1]}|`;
            }
            ret += table[i].slice(0, wordLen + 1).map(n => pad(n.toString(), 3)).join('|') + '\n';
        }
        return ret;
    }
    function printTables(pattern, patternStart, word, wordStart) {
        pattern = pattern.substr(patternStart);
        word = word.substr(wordStart);
        console.log(printTable(_table, pattern, pattern.length, word, word.length));
        console.log(printTable(_arrows, pattern, pattern.length, word, word.length));
        console.log(printTable(_diag, pattern, pattern.length, word, word.length));
    }
    function isSeparatorAtPos(value, index) {
        if (index < 0 || index >= value.length) {
            return false;
        }
        const code = value.codePointAt(index);
        switch (code) {
            case 95 /* CharCode.Underline */:
            case 45 /* CharCode.Dash */:
            case 46 /* CharCode.Period */:
            case 32 /* CharCode.Space */:
            case 47 /* CharCode.Slash */:
            case 92 /* CharCode.Backslash */:
            case 39 /* CharCode.SingleQuote */:
            case 34 /* CharCode.DoubleQuote */:
            case 58 /* CharCode.Colon */:
            case 36 /* CharCode.DollarSign */:
            case 60 /* CharCode.LessThan */:
            case 62 /* CharCode.GreaterThan */:
            case 40 /* CharCode.OpenParen */:
            case 41 /* CharCode.CloseParen */:
            case 91 /* CharCode.OpenSquareBracket */:
            case 93 /* CharCode.CloseSquareBracket */:
            case 123 /* CharCode.OpenCurlyBrace */:
            case 125 /* CharCode.CloseCurlyBrace */:
                return true;
            case undefined:
                return false;
            default:
                if (strings.isEmojiImprecise(code)) {
                    return true;
                }
                return false;
        }
    }
    function isWhitespaceAtPos(value, index) {
        if (index < 0 || index >= value.length) {
            return false;
        }
        const code = value.charCodeAt(index);
        switch (code) {
            case 32 /* CharCode.Space */:
            case 9 /* CharCode.Tab */:
                return true;
            default:
                return false;
        }
    }
    function isUpperCaseAtPos(pos, word, wordLow) {
        return word[pos] !== wordLow[pos];
    }
    function isPatternInWord(patternLow, patternPos, patternLen, wordLow, wordPos, wordLen, fillMinWordPosArr = false) {
        while (patternPos < patternLen && wordPos < wordLen) {
            if (patternLow[patternPos] === wordLow[wordPos]) {
                if (fillMinWordPosArr) {
                    // Remember the min word position for each pattern position
                    _minWordMatchPos[patternPos] = wordPos;
                }
                patternPos += 1;
            }
            wordPos += 1;
        }
        return patternPos === patternLen; // pattern must be exhausted
    }
    exports.isPatternInWord = isPatternInWord;
    var Arrow;
    (function (Arrow) {
        Arrow[Arrow["Diag"] = 1] = "Diag";
        Arrow[Arrow["Left"] = 2] = "Left";
        Arrow[Arrow["LeftLeft"] = 3] = "LeftLeft";
    })(Arrow || (Arrow = {}));
    var FuzzyScore;
    (function (FuzzyScore) {
        /**
         * No matches and value `-100`
         */
        FuzzyScore.Default = ([-100, 0]);
        function isDefault(score) {
            return !score || (score.length === 2 && score[0] === -100 && score[1] === 0);
        }
        FuzzyScore.isDefault = isDefault;
    })(FuzzyScore || (exports.FuzzyScore = FuzzyScore = {}));
    class FuzzyScoreOptions {
        static { this.default = { boostFullMatch: true, firstMatchCanBeWeak: false }; }
        constructor(firstMatchCanBeWeak, boostFullMatch) {
            this.firstMatchCanBeWeak = firstMatchCanBeWeak;
            this.boostFullMatch = boostFullMatch;
        }
    }
    exports.FuzzyScoreOptions = FuzzyScoreOptions;
    function fuzzyScore(pattern, patternLow, patternStart, word, wordLow, wordStart, options = FuzzyScoreOptions.default) {
        const patternLen = pattern.length > _maxLen ? _maxLen : pattern.length;
        const wordLen = word.length > _maxLen ? _maxLen : word.length;
        if (patternStart >= patternLen || wordStart >= wordLen || (patternLen - patternStart) > (wordLen - wordStart)) {
            return undefined;
        }
        // Run a simple check if the characters of pattern occur
        // (in order) at all in word. If that isn't the case we
        // stop because no match will be possible
        if (!isPatternInWord(patternLow, patternStart, patternLen, wordLow, wordStart, wordLen, true)) {
            return undefined;
        }
        // Find the max matching word position for each pattern position
        // NOTE: the min matching word position was filled in above, in the `isPatternInWord` call
        _fillInMaxWordMatchPos(patternLen, wordLen, patternStart, wordStart, patternLow, wordLow);
        let row = 1;
        let column = 1;
        let patternPos = patternStart;
        let wordPos = wordStart;
        const hasStrongFirstMatch = [false];
        // There will be a match, fill in tables
        for (row = 1, patternPos = patternStart; patternPos < patternLen; row++, patternPos++) {
            // Reduce search space to possible matching word positions and to possible access from next row
            const minWordMatchPos = _minWordMatchPos[patternPos];
            const maxWordMatchPos = _maxWordMatchPos[patternPos];
            const nextMaxWordMatchPos = (patternPos + 1 < patternLen ? _maxWordMatchPos[patternPos + 1] : wordLen);
            for (column = minWordMatchPos - wordStart + 1, wordPos = minWordMatchPos; wordPos < nextMaxWordMatchPos; column++, wordPos++) {
                let score = Number.MIN_SAFE_INTEGER;
                let canComeDiag = false;
                if (wordPos <= maxWordMatchPos) {
                    score = _doScore(pattern, patternLow, patternPos, patternStart, word, wordLow, wordPos, wordLen, wordStart, _diag[row - 1][column - 1] === 0, hasStrongFirstMatch);
                }
                let diagScore = 0;
                if (score !== Number.MAX_SAFE_INTEGER) {
                    canComeDiag = true;
                    diagScore = score + _table[row - 1][column - 1];
                }
                const canComeLeft = wordPos > minWordMatchPos;
                const leftScore = canComeLeft ? _table[row][column - 1] + (_diag[row][column - 1] > 0 ? -5 : 0) : 0; // penalty for a gap start
                const canComeLeftLeft = wordPos > minWordMatchPos + 1 && _diag[row][column - 1] > 0;
                const leftLeftScore = canComeLeftLeft ? _table[row][column - 2] + (_diag[row][column - 2] > 0 ? -5 : 0) : 0; // penalty for a gap start
                if (canComeLeftLeft && (!canComeLeft || leftLeftScore >= leftScore) && (!canComeDiag || leftLeftScore >= diagScore)) {
                    // always prefer choosing left left to jump over a diagonal because that means a match is earlier in the word
                    _table[row][column] = leftLeftScore;
                    _arrows[row][column] = 3 /* Arrow.LeftLeft */;
                    _diag[row][column] = 0;
                }
                else if (canComeLeft && (!canComeDiag || leftScore >= diagScore)) {
                    // always prefer choosing left since that means a match is earlier in the word
                    _table[row][column] = leftScore;
                    _arrows[row][column] = 2 /* Arrow.Left */;
                    _diag[row][column] = 0;
                }
                else if (canComeDiag) {
                    _table[row][column] = diagScore;
                    _arrows[row][column] = 1 /* Arrow.Diag */;
                    _diag[row][column] = _diag[row - 1][column - 1] + 1;
                }
                else {
                    throw new Error(`not possible`);
                }
            }
        }
        if (_debug) {
            printTables(pattern, patternStart, word, wordStart);
        }
        if (!hasStrongFirstMatch[0] && !options.firstMatchCanBeWeak) {
            return undefined;
        }
        row--;
        column--;
        const result = [_table[row][column], wordStart];
        let backwardsDiagLength = 0;
        let maxMatchColumn = 0;
        while (row >= 1) {
            // Find the column where we go diagonally up
            let diagColumn = column;
            do {
                const arrow = _arrows[row][diagColumn];
                if (arrow === 3 /* Arrow.LeftLeft */) {
                    diagColumn = diagColumn - 2;
                }
                else if (arrow === 2 /* Arrow.Left */) {
                    diagColumn = diagColumn - 1;
                }
                else {
                    // found the diagonal
                    break;
                }
            } while (diagColumn >= 1);
            // Overturn the "forwards" decision if keeping the "backwards" diagonal would give a better match
            if (backwardsDiagLength > 1 // only if we would have a contiguous match of 3 characters
                && patternLow[patternStart + row - 1] === wordLow[wordStart + column - 1] // only if we can do a contiguous match diagonally
                && !isUpperCaseAtPos(diagColumn + wordStart - 1, word, wordLow) // only if the forwards chose diagonal is not an uppercase
                && backwardsDiagLength + 1 > _diag[row][diagColumn] // only if our contiguous match would be longer than the "forwards" contiguous match
            ) {
                diagColumn = column;
            }
            if (diagColumn === column) {
                // this is a contiguous match
                backwardsDiagLength++;
            }
            else {
                backwardsDiagLength = 1;
            }
            if (!maxMatchColumn) {
                // remember the last matched column
                maxMatchColumn = diagColumn;
            }
            row--;
            column = diagColumn - 1;
            result.push(column);
        }
        if (wordLen === patternLen && options.boostFullMatch) {
            // the word matches the pattern with all characters!
            // giving the score a total match boost (to come up ahead other words)
            result[0] += 2;
        }
        // Add 1 penalty for each skipped character in the word
        const skippedCharsCount = maxMatchColumn - patternLen;
        result[0] -= skippedCharsCount;
        return result;
    }
    exports.fuzzyScore = fuzzyScore;
    function _fillInMaxWordMatchPos(patternLen, wordLen, patternStart, wordStart, patternLow, wordLow) {
        let patternPos = patternLen - 1;
        let wordPos = wordLen - 1;
        while (patternPos >= patternStart && wordPos >= wordStart) {
            if (patternLow[patternPos] === wordLow[wordPos]) {
                _maxWordMatchPos[patternPos] = wordPos;
                patternPos--;
            }
            wordPos--;
        }
    }
    function _doScore(pattern, patternLow, patternPos, patternStart, word, wordLow, wordPos, wordLen, wordStart, newMatchStart, outFirstMatchStrong) {
        if (patternLow[patternPos] !== wordLow[wordPos]) {
            return Number.MIN_SAFE_INTEGER;
        }
        let score = 1;
        let isGapLocation = false;
        if (wordPos === (patternPos - patternStart)) {
            // common prefix: `foobar <-> foobaz`
            //                            ^^^^^
            score = pattern[patternPos] === word[wordPos] ? 7 : 5;
        }
        else if (isUpperCaseAtPos(wordPos, word, wordLow) && (wordPos === 0 || !isUpperCaseAtPos(wordPos - 1, word, wordLow))) {
            // hitting upper-case: `foo <-> forOthers`
            //                              ^^ ^
            score = pattern[patternPos] === word[wordPos] ? 7 : 5;
            isGapLocation = true;
        }
        else if (isSeparatorAtPos(wordLow, wordPos) && (wordPos === 0 || !isSeparatorAtPos(wordLow, wordPos - 1))) {
            // hitting a separator: `. <-> foo.bar`
            //                                ^
            score = 5;
        }
        else if (isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1)) {
            // post separator: `foo <-> bar_foo`
            //                              ^^^
            score = 5;
            isGapLocation = true;
        }
        if (score > 1 && patternPos === patternStart) {
            outFirstMatchStrong[0] = true;
        }
        if (!isGapLocation) {
            isGapLocation = isUpperCaseAtPos(wordPos, word, wordLow) || isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1);
        }
        //
        if (patternPos === patternStart) { // first character in pattern
            if (wordPos > wordStart) {
                // the first pattern character would match a word character that is not at the word start
                // so introduce a penalty to account for the gap preceding this match
                score -= isGapLocation ? 3 : 5;
            }
        }
        else {
            if (newMatchStart) {
                // this would be the beginning of a new match (i.e. there would be a gap before this location)
                score += isGapLocation ? 2 : 0;
            }
            else {
                // this is part of a contiguous match, so give it a slight bonus, but do so only if it would not be a preferred gap location
                score += isGapLocation ? 0 : 1;
            }
        }
        if (wordPos + 1 === wordLen) {
            // we always penalize gaps, but this gives unfair advantages to a match that would match the last character in the word
            // so pretend there is a gap after the last character in the word to normalize things
            score -= isGapLocation ? 3 : 5;
        }
        return score;
    }
    //#endregion
    //#region --- graceful ---
    function fuzzyScoreGracefulAggressive(pattern, lowPattern, patternPos, word, lowWord, wordPos, options) {
        return fuzzyScoreWithPermutations(pattern, lowPattern, patternPos, word, lowWord, wordPos, true, options);
    }
    exports.fuzzyScoreGracefulAggressive = fuzzyScoreGracefulAggressive;
    function fuzzyScoreGraceful(pattern, lowPattern, patternPos, word, lowWord, wordPos, options) {
        return fuzzyScoreWithPermutations(pattern, lowPattern, patternPos, word, lowWord, wordPos, false, options);
    }
    exports.fuzzyScoreGraceful = fuzzyScoreGraceful;
    function fuzzyScoreWithPermutations(pattern, lowPattern, patternPos, word, lowWord, wordPos, aggressive, options) {
        let top = fuzzyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos, options);
        if (top && !aggressive) {
            // when using the original pattern yield a result we`
            // return it unless we are aggressive and try to find
            // a better alignment, e.g. `cno` -> `^co^ns^ole` or `^c^o^nsole`.
            return top;
        }
        if (pattern.length >= 3) {
            // When the pattern is long enough then try a few (max 7)
            // permutations of the pattern to find a better match. The
            // permutations only swap neighbouring characters, e.g
            // `cnoso` becomes `conso`, `cnsoo`, `cnoos`.
            const tries = Math.min(7, pattern.length - 1);
            for (let movingPatternPos = patternPos + 1; movingPatternPos < tries; movingPatternPos++) {
                const newPattern = nextTypoPermutation(pattern, movingPatternPos);
                if (newPattern) {
                    const candidate = fuzzyScore(newPattern, newPattern.toLowerCase(), patternPos, word, lowWord, wordPos, options);
                    if (candidate) {
                        candidate[0] -= 3; // permutation penalty
                        if (!top || candidate[0] > top[0]) {
                            top = candidate;
                        }
                    }
                }
            }
        }
        return top;
    }
    function nextTypoPermutation(pattern, patternPos) {
        if (patternPos + 1 >= pattern.length) {
            return undefined;
        }
        const swap1 = pattern[patternPos];
        const swap2 = pattern[patternPos + 1];
        if (swap1 === swap2) {
            return undefined;
        }
        return pattern.slice(0, patternPos)
            + swap2
            + swap1
            + pattern.slice(patternPos + 2);
    }
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vZmlsdGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQmhHLG1CQUFtQjtJQUVuQjs7Ozs7T0FLRztJQUNILFNBQWdCLEVBQUUsQ0FBQyxHQUFHLE1BQWlCO1FBQ3RDLE9BQU8sVUFBVSxJQUFZLEVBQUUsa0JBQTBCO1lBQ3hELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDbkQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUNYLE9BQU8sS0FBSyxDQUFDO2dCQUNkLENBQUM7WUFDRixDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUM7SUFDSCxDQUFDO0lBVkQsZ0JBVUM7SUFFRCxTQUFTO0lBRUksUUFBQSxtQkFBbUIsR0FBWSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyRSxRQUFBLGFBQWEsR0FBWSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUUzRSxTQUFTLGNBQWMsQ0FBQyxVQUFtQixFQUFFLElBQVksRUFBRSxrQkFBMEI7UUFDcEYsSUFBSSxDQUFDLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDcEUsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsSUFBSSxPQUFnQixDQUFDO1FBQ3JCLElBQUks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
//# sourceURL=../../../vs/base/common/filters.js
})
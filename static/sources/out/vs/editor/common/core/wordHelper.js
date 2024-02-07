/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/linkedList"], function (require, exports, iterator_1, lifecycle_1, linkedList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWordAtText = exports.setDefaultGetWordAtTextConfig = exports.ensureValidWordDefinition = exports.DEFAULT_WORD_REGEXP = exports.USUAL_WORD_SEPARATORS = void 0;
    exports.USUAL_WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?';
    /**
     * Create a word definition regular expression based on default word separators.
     * Optionally provide allowed separators that should be included in words.
     *
     * The default would look like this:
     * /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g
     */
    function createWordRegExp(allowInWords = '') {
        let source = '(-?\\d*\\.\\d\\w*)|([^';
        for (const sep of exports.USUAL_WORD_SEPARATORS) {
            if (allowInWords.indexOf(sep) >= 0) {
                continue;
            }
            source += '\\' + sep;
        }
        source += '\\s]+)';
        return new RegExp(source, 'g');
    }
    // catches numbers (including floating numbers) in the first group, and alphanum in the second
    exports.DEFAULT_WORD_REGEXP = createWordRegExp();
    function ensureValidWordDefinition(wordDefinition) {
        let result = exports.DEFAULT_WORD_REGEXP;
        if (wordDefinition && (wordDefinition instanceof RegExp)) {
            if (!wordDefinition.global) {
                let flags = 'g';
                if (wordDefinition.ignoreCase) {
                    flags += 'i';
                }
                if (wordDefinition.multiline) {
                    flags += 'm';
                }
                if (wordDefinition.unicode) {
                    flags += 'u';
                }
                result = new RegExp(wordDefinition.source, flags);
            }
            else {
                result = wordDefinition;
            }
        }
        result.lastIndex = 0;
        return result;
    }
    exports.ensureValidWordDefinition = ensureValidWordDefinition;
    const _defaultConfig = new linkedList_1.LinkedList();
    _defaultConfig.unshift({
        maxLen: 1000,
        windowSize: 15,
        timeBudget: 150
    });
    function setDefaultGetWordAtTextConfig(value) {
        const rm = _defaultConfig.unshift(value);
        return (0, lifecycle_1.toDisposable)(rm);
    }
    exports.setDefaultGetWordAtTextConfig = setDefaultGetWordAtTextConfig;
    function getWordAtText(column, wordDefinition, text, textOffset, config) {
        // Ensure the regex has the 'g' flag, otherwise this will loop forever
        wordDefinition = ensureValidWordDefinition(wordDefinition);
        if (!config) {
            config = iterator_1.Iterable.first(_defaultConfig);
        }
        if (text.length > config.maxLen) {
            // don't throw strings that long at the regexp
            // but use a sub-string in which a word must occur
            let start = column - config.maxLen / 2;
            if (start < 0) {
                start = 0;
            }
            else {
                textOffset += start;
            }
            text = text.substring(start, column + config.maxLen / 2);
            return getWordAtText(column, wordDefinition, text, textOffset, config);
        }
        const t1 = Date.now();
        const pos = column - 1 - textOffset;
        let prevRegexIndex = -1;
        let match = null;
        for (let i = 1;; i++) {
            // check time budget
            if (Date.now() - t1 >= config.timeBudget) {
                break;
            }
            // reset the index at which the regexp should start matching, also know where it
            // should stop so that subsequent search don't repeat previous searches
            const regexIndex = pos - config.windowSize * i;
            wordDefinition.lastIndex = Math.max(0, regexIndex);
            const thisMatch = _findRegexMatchEnclosingPosition(wordDefinition, text, pos, prevRegexIndex);
            if (!thisMatch && match) {
                // stop: we have something
                break;
            }
            match = thisMatch;
            // stop: searched at start
            if (regexIndex <= 0) {
                break;
            }
            prevRegexIndex = regexIndex;
        }
        if (match) {
            const result = {
                word: match[0],
                startColumn: textOffset + 1 + match.index,
                endColumn: textOffset + 1 + match.index + match[0].length
            };
            wordDefinition.lastIndex = 0;
            return result;
        }
        return null;
    }
    exports.getWordAtText = getWordAtText;
    function _findRegexMatchEnclosingPosition(wordDefinition, text, pos, stopPos) {
        let match;
        while (match = wordDefinition.exec(text)) {
            const matchIndex = match.index || 0;
            if (matchIndex <= pos && wordDefinition.lastIndex >= pos) {
                return match;
            }
            else if (stopPos > 0 && matchIndex > stopPos) {
                return null;
            }
        }
        return null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9jb3JlL3dvcmRIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTW5GLFFBQUEscUJBQXFCLEdBQUcsbUNBQW1DLENBQUM7SUFvQnpFOzs7Ozs7T0FNRztJQUNILFNBQVMsZ0JBQWdCLENBQUMsZUFBdUIsRUFBRTtRQUNsRCxJQUFJLE1BQU0sR0FBRyx3QkFBd0IsQ0FBQztRQUN0QyxLQUFLLE1BQU0sR0FBRyxJQUFJLDZCQUFxQixFQUFFLENBQUM7WUFDekMsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNwQyxTQUFTO1lBQ1YsQ0FBQztZQUNELE1BQU0sSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ3RCLENBQUM7UUFDRCxNQUFNLElBQUksUUFBUSxDQUFDO1FBQ25CLE9BQU8sSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCw4RkFBOEY7SUFDakYsUUFBQSxtQkFBbUIsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO0lBRXRELFNBQWdCLHlCQUF5QixDQUFDLGNBQThCO1FBQ3ZFLElBQUksTUFBTSxHQUFXLDJCQUFtQixDQUFDO1FBRXpDLElBQUksY0FBYyxJQUFJLENBQUMsY0FBYyxZQUFZLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDMUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUNoQixJQUFJLGNBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDL0IsS0FBSyxJQUFJLEdBQUcsQ0FBQztnQkFDZCxDQUFDO2dCQUNELElBQUksY0FBYyxDQUFD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
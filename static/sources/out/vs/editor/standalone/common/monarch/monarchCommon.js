/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stateExists = exports.findRules = exports.substituteMatches = exports.createError = exports.log = exports.sanitize = exports.fixCase = exports.empty = exports.isIAction = exports.isString = exports.isFuzzyAction = exports.isFuzzyActionArr = exports.MonarchBracket = void 0;
    /*
     * This module exports common types and functionality shared between
     * the Monarch compiler that compiles JSON to ILexer, and the Monarch
     * Tokenizer (that highlights at runtime)
     */
    /*
     * Type definitions to be used internally to Monarch.
     * Inside monarch we use fully typed definitions and compiled versions of the more abstract JSON descriptions.
     */
    var MonarchBracket;
    (function (MonarchBracket) {
        MonarchBracket[MonarchBracket["None"] = 0] = "None";
        MonarchBracket[MonarchBracket["Open"] = 1] = "Open";
        MonarchBracket[MonarchBracket["Close"] = -1] = "Close";
    })(MonarchBracket || (exports.MonarchBracket = MonarchBracket = {}));
    function isFuzzyActionArr(what) {
        return (Array.isArray(what));
    }
    exports.isFuzzyActionArr = isFuzzyActionArr;
    function isFuzzyAction(what) {
        return !isFuzzyActionArr(what);
    }
    exports.isFuzzyAction = isFuzzyAction;
    function isString(what) {
        return (typeof what === 'string');
    }
    exports.isString = isString;
    function isIAction(what) {
        return !isString(what);
    }
    exports.isIAction = isIAction;
    // Small helper functions
    /**
     * Is a string null, undefined, or empty?
     */
    function empty(s) {
        return (s ? false : true);
    }
    exports.empty = empty;
    /**
     * Puts a string to lower case if 'ignoreCase' is set.
     */
    function fixCase(lexer, str) {
        return (lexer.ignoreCase && str ? str.toLowerCase() : str);
    }
    exports.fixCase = fixCase;
    /**
     * Ensures there are no bad characters in a CSS token class.
     */
    function sanitize(s) {
        return s.replace(/[&<>'"_]/g, '-'); // used on all output token CSS classes
    }
    exports.sanitize = sanitize;
    // Logging
    /**
     * Logs a message.
     */
    function log(lexer, msg) {
        console.log(`${lexer.languageId}: ${msg}`);
    }
    exports.log = log;
    // Throwing errors
    function createError(lexer, msg) {
        return new Error(`${lexer.languageId}: ${msg}`);
    }
    exports.createError = createError;
    // Helper functions for rule finding and substitution
    /**
     * substituteMatches is used on lexer strings and can substitutes predefined patterns:
     * 		$$  => $
     * 		$#  => id
     * 		$n  => matched entry n
     * 		@attr => contents of lexer[attr]
     *
     * See documentation for more info
     */
    function substituteMatches(lexer, str, id, matches, state) {
        const re = /\$((\$)|(#)|(\d\d?)|[sS](\d\d?)|@(\w+))/g;
        let stateMatches = null;
        return str.replace(re, function (full, sub, dollar, hash, n, s, attr, ofs, total) {
            if (!empty(dollar)) {
                return '$'; // $$
            }
            if (!empty(hash)) {
                return fixCase(lexer, id); // default $#
            }
            if (!empty(n) && n < matches.length) {
                return fixCase(lexer, matches[n]); // $n
            }
            if (!empty(attr) && lexer && typeof (lexer[attr]) === 'string') {
                return lexer[attr]; //@attribute
            }
            if (stateMatches === null) { // split state on demand
                stateMatches = state.split('.');
                stateMatches.unshift(state);
            }
            if (!empty(s) && s < stateMatches.length) {
                return fixCase(lexer, stateMatches[s]); //$Sn
            }
            return '';
        });
    }
    exports.substituteMatches = substituteMatches;
    /**
     * Find the tokenizer rules for a specific state (i.e. next action)
     */
    function findRules(lexer, inState) {
        let state = inState;
        while (state && state.length > 0) {
            const rules = lexer.tokenizer[state];
            if (rules) {
                return rules;
            }
            const idx = state.lastIndexOf('.');
            if (idx < 0) {
                state = null; // no further parent
            }
            else {
                state = state.substr(0, idx);
            }
        }
        return null;
    }
    exports.findRules = findRules;
    /**
     * Is a certain state defined? In contrast to 'findRules' this works on a ILexerMin.
     * This is used during compilation where we may know the defined states
     * but not yet whether the corresponding rules are correct.
     */
    function stateExists(lexer, inState) {
        let state = inState;
        while (state && state.length > 0) {
            const exist = lexer.stateNames[state];
            if (exist) {
                return true;
            }
            const idx = state.lastIndexOf('.');
            if (idx < 0) {
                state = null; // no further parent
            }
            else {
                state = state.substr(0, idx);
            }
        }
        return false;
    }
    exports.stateExists = stateExists;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uYXJjaENvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvY29tbW9uL21vbmFyY2gvbW9uYXJjaENvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEc7Ozs7T0FJRztJQUVIOzs7T0FHRztJQUVILElBQWtCLGNBSWpCO0lBSkQsV0FBa0IsY0FBYztRQUMvQixtREFBUSxDQUFBO1FBQ1IsbURBQVEsQ0FBQTtRQUNSLHNEQUFVLENBQUE7SUFDWCxDQUFDLEVBSmlCLGNBQWMsOEJBQWQsY0FBYyxRQUkvQjtJQWlDRCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFpQztRQUNqRSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFGRCw0Q0FFQztJQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFpQztRQUM5RCxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUZELHNDQUVDO0lBRUQsU0FBZ0IsUUFBUSxDQUFDLElBQWlCO1FBQ3pDLE9BQU8sQ0FBQyxPQUFPLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRkQsNEJBRUM7SUFFRCxTQUFnQixTQUFTLENBQUMsSUFBaUI7UUFDMUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRkQsOEJBRUM7SUFrQ0QseUJBQXlCO0lBRXpCOztPQUVHO0lBQ0gsU0FBZ0IsS0FBSyxDQUFDLENBQVM7UUFDOUIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRkQsc0JBRUM7SUFFRDs7T0FFRztJQUNILFNBQWdC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
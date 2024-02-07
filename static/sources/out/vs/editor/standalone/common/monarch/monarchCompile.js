/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/standalone/common/monarch/monarchCommon"], function (require, exports, monarchCommon) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compile = void 0;
    /*
     * Type helpers
     *
     * Note: this is just for sanity checks on the JSON description which is
     * helpful for the programmer. No checks are done anymore once the lexer is
     * already 'compiled and checked'.
     *
     */
    function isArrayOf(elemType, obj) {
        if (!obj) {
            return false;
        }
        if (!(Array.isArray(obj))) {
            return false;
        }
        for (const el of obj) {
            if (!(elemType(el))) {
                return false;
            }
        }
        return true;
    }
    function bool(prop, defValue) {
        if (typeof prop === 'boolean') {
            return prop;
        }
        return defValue;
    }
    function string(prop, defValue) {
        if (typeof (prop) === 'string') {
            return prop;
        }
        return defValue;
    }
    function arrayToHash(array) {
        const result = {};
        for (const e of array) {
            result[e] = true;
        }
        return result;
    }
    function createKeywordMatcher(arr, caseInsensitive = false) {
        if (caseInsensitive) {
            arr = arr.map(function (x) { return x.toLowerCase(); });
        }
        const hash = arrayToHash(arr);
        if (caseInsensitive) {
            return function (word) {
                return hash[word.toLowerCase()] !== undefined && hash.hasOwnProperty(word.toLowerCase());
            };
        }
        else {
            return function (word) {
                return hash[word] !== undefined && hash.hasOwnProperty(word);
            };
        }
    }
    // Lexer helpers
    /**
     * Compiles a regular expression string, adding the 'i' flag if 'ignoreCase' is set, and the 'u' flag if 'unicode' is set.
     * Also replaces @\w+ or sequences with the content of the specified attribute
     * @\w+ replacement can be avoided by escaping `@` signs with another `@` sign.
     * @example /@attr/ will be replaced with the value of lexer[attr]
     * @example /@@text/ will not be replaced and will become /@text/.
     */
    function compileRegExp(lexer, str) {
        // @@ must be interpreted as a literal @, so we replace all occurences of @@ with a placeholder character
        str = str.replace(/@@/g, `\x01`);
        let n = 0;
        let hadExpansion;
        do {
            hadExpansion = false;
            str = str.replace(/@(\w+)/g, function (s, attr) {
                hadExpansion = true;
                let sub = '';
                if (typeof (lexer[attr]) === 'string') {
                    sub = lexer[attr];
                }
                else if (lexer[attr] && lexer[attr] instanceof RegExp) {
                    sub = lexer[attr].source;
                }
                else {
                    if (lexer[attr] === undefined) {
                        throw monarchCommon.createError(lexer, 'language definition does not contain attribute \'' + attr + '\', used at: ' + str);
                    }
                    else {
                        throw monarchCommon.createError(lexer, 'attribute reference \'' + attr + '\' must be a string, used at: ' + str);
                    }
                }
                return (monarchCommon.empty(sub) ? '' : '(?:' + sub + ')');
            });
            n++;
        } while (hadExpansion && n < 5);
        // handle escaped @@
        str = str.replace(/\x01/g, '@');
        const flags = (lexer.ignoreCase ? 'i' : '') + (lexer.unicode ? 'u' : '');
        return new RegExp(str, flags);
    }
    /**
     * Compiles guard functions for case matches.
     * This compiles 'cases' attributes into efficient match functions.
     *
     */
    function selectScrutinee(id, matches, state, num) {
        if (num < 0) {
            return id;
        }
        if (num < matches.length) {
            return matches[num];
        }
        if (num >= 100) {
            num = num - 100;
            const parts = state.split('.');
            parts.unshift(state);
            if (num < parts.length) {
                return parts[num];
            }
        }
        return null;
    }
    function createGuard(lexer, ruleName, tkey, val) {
        // get the scrutinee and pattern
        let scrut = -1; // -1: $!, 0-99: $n, 100+n: $Sn
        let oppat = tkey;
        let matches = tkey.match(/^\$(([sS]?)(\d\d?)|#)(.*)$/);
        if (matches) {
            if (matches[3]) { // if digits
                scrut = parseInt(matches[3]);
                if (matches[2]) {
                    scrut = scrut + 100; // if [sS] present
                }
            }
            oppat = matches[4];
        }
        // get operator
        let op = '~';
        let pat = oppat;
        if (!oppat || oppat.length === 0) {
            op = '!=';
            pat = '';
        }
        else if (/^\w*$/.test(pat)) { // just a word
            op = '==';
        }
        else {
            matches = oppat.match(/^(@|!@|~|!~|==|!=)(.*)$/);
            if (matches) {
                op = matches[1];
                pat = matches[2];
            }
        }
        // set the tester function
        let tester;
        // special case a regexp that matches just words
        if ((op === '~' || op === '!~') && /^(\w|\|)*$/.test(pat)) {
            const inWords = createKeywordMatcher(pat.split('|'), lexer.ignoreCase);
            tester = function (s) { return (op === '~' ? inWords(s) : !inWords(s)); };
        }
        else if (op === '@' || op === '!@') {
            const words = lexer[pat];
            if (!words) {
                throw monarchCommon.createError(lexer, 'the @ match target \'' + pat + '\' is not defined, in rule: ' + ruleName);
            }
            if (!(isArrayOf(function (elem) { return (typeof (elem) === 'string'); }, words))) {
                throw monarchCommon.createError(lexer, 'the @ match target \'' + pat + '\' must be an array of strings, in rule: ' + ruleName);
            }
            const inWords = createKeywordMatcher(words, lexer.ignoreCase);
            tester = function (s) { return (op === '@' ? inWords(s) : !inWords(s)); };
        }
        else if (op === '~' || op === '!~') {
            if (pat.indexOf('$') < 0) {
                // precompile regular expression
                const re = compileRegExp(lexer, '^' + pat + '$');
                tester = function (s) { return (op === '~' ? re.test(s) : !re.test(s)); };
            }
            else {
                tester = function (s, id, matches, state) {
                    const re = compileRegExp(lexer, '^' + monarchCommon.substituteMatches(lexer, pat, id, matches, state) + '$');
                    return re.test(s);
                };
            }
        }
        else { // if (op==='==' || op==='!=') {
            if (pat.indexOf('$') < 0) {
                const patx = monarchCommon.fixCase(lexer, pat);
                tester = function (s) { return (op === '==' ? s === patx : s !== patx); };
            }
            else {
                const patx = monarchCommon.fixCase(lexer, pat);
                tester = function (s, id, matches, state, eos) {
                    const patexp = monarchCommon.substituteMatches(lexer, patx, id, matches, state);
                    return (op === '==' ? s === patexp : s !== patexp);
                };
            }
        }
        // return the branch object
        if (scrut === -1) {
            return {
                name: tkey, value: val, test: function (id, matches, state, eos) {
                    return tester(id, id, matches, state, eos);
                }
            };
        }
        else {
            return {
                name: tkey, value: val, test: function (id, matches, state, eos) {
                    const scrutinee = selectScrutinee(id, matches, state, scrut);
                    return tester(!scrutinee ? '' : scrutinee, id, matches, state, eos);
                }
            };
        }
    }
    /**
     * Compiles an action: i.e. optimize regular expressions and case matches
     * and do many sanity checks.
     *
     * This is called only during compilation but if the lexer definition
     * contains user functions as actions (which is usually not allowed), then this
     * may be called during lexing. It is important therefore to compile common cases efficiently
     */
    function compileAction(lexer, ruleName, action) {
        if (!action) {
            return { token: '' };
        }
        else if (typeof (action) === 'string') {
            return action; // { token: action };
        }
        else if (action.token || action.token === '') {
            if (typeof (action.token) !== 'string') {
                throw monarchCommon.createError(lexer, 'a \'token\' attribute must be of type string, in rule: ' + ruleName);
            }
            else {
                // only copy specific typed fields (only happens once during compile Lexer)
                const newAction = { token: action.token };
                if (action.token.indexOf('$') >= 0) {
                    newAction.tokenSubst = true;
                }
                if (typeof (action.bracket) === 'string') {
                    if (action.bracket === '@open') {
                        newAction.bracket = 1 /* monarchCommon.MonarchBracket.Open */;
                    }
                    else if (action.bracket === '@close') {
                        newAction.bracket = -1 /* monarchCommon.MonarchBracket.Close */;
                    }
                    else {
                        throw monarchCommon.createError(lexer, 'a \'bracket\' attribute must be either \'@open\' or \'@close\', in rule: ' + ruleName);
                    }
                }
                if (action.next) {
                    if (typeof (action.next) !== 'string') {
                        throw monarchCommon.createError(lexer, 'the next state must be a string value in rule: ' + ruleName);
                    }
                    else {
                        let next = action.next;
                        if (!/^(@pop|@push|@popall)$/.test(next)) {
                            if (next[0] === '@') {
                                next = next.substr(1); // peel off starting @ sign
                            }
                            if (next.indexOf('$') < 0) { // no dollar substitution, we can check if the state exists
                                if (!monarchCommon.stateExists(lexer, monarchCommon.substituteMatches(lexer, next, '', [], ''))) {
                                    throw monarchCommon.createError(lexer, 'the next state \'' + action.next + '\' is not defined in rule: ' + ruleName);
                                }
                            }
                        }
                        newAction.next = next;
                    }
                }
                if (typeof (action.goBack) === 'number') {
                    newAction.goBack = action.goBack;
                }
                if (typeof (action.switchTo) === 'string') {
                    newAction.switchTo = action.switchTo;
                }
                if (typeof (action.log) === 'string') {
                    newAction.log = action.log;
                }
                if (typeof (action.nextEmbedded) === 'string') {
                    newAction.nextEmbedded = action.nextEmbedded;
                    lexer.usesEmbedded = true;
                }
                return newAction;
            }
        }
        else if (Array.isArray(action)) {
            const results = [];
            for (let i = 0, len = action.length; i < len; i++) {
                results[i] = compileAction(lexer, ruleName, action[i]);
            }
            return { group: results };
        }
        else if (action.cases) {
            // build an array of test cases
            const cases = [];
            // for each case, push a test function and result value
            for (const tkey in action.cases) {
                if (action.cases.hasOwnProperty(tkey)) {
                    const val = compileAction(lexer, ruleName, action.cases[tkey]);
                    // what kind of case
                    if (tkey === '@default' || tkey === '@' || tkey === '') {
                        cases.push({ test: undefined, value: val, name: tkey });
                    }
                    else if (tkey === '@eos') {
                        cases.push({ test: function (id, matches, state, eos) { return eos; }, value: val, name: tkey });
                    }
                    else {
                        cases.push(createGuard(lexer, ruleName, tkey, val)); // call separate function to avoid local variable capture
                    }
                }
            }
            // create a matching function
            const def = lexer.defaultToken;
            return {
                test: function (id, matches, state, eos) {
                    for (const _case of cases) {
                        const didmatch = (!_case.test || _case.test(id, matches, state, eos));
                        if (didmatch) {
                            return _case.value;
                        }
                    }
                    return def;
                }
            };
        }
        else {
            throw monarchCommon.createError(lexer, 'an action must be a string, an object with a \'token\' or \'cases\' attribute, or an array of actions; in rule: ' + ruleName);
        }
    }
    /**
     * Helper class for creating matching rules
     */
    class Rule {
        constructor(name) {
            this.regex = new RegExp('');
            this.action = { token: '' };
            this.matchOnlyAtLineStart = false;
            this.name = '';
            this.name = name;
        }
        setRegex(lexer, re) {
            let sregex;
            if (typeof (re) === 'string') {
                sregex = re;
            }
            else if (re instanceof RegExp) {
                sregex = re.source;
            }
            else {
                throw monarchCommon.createError(lexer, 'rules must start with a match string or regular expression: ' + this.name);
            }
            this.matchOnlyAtLineStart = (sregex.length > 0 && sregex[0] === '^');
            this.name = this.name + ': ' + sregex;
            this.regex = compileRegExp(lexer, '^(?:' + (this.matchOnlyAtLineStart ? sregex.substr(1) : sregex) + ')');
        }
        setAction(lexer, act) {
            this.action = compileAction(lexer, this.name, act);
        }
    }
    /**
     * Compiles a json description function into json where all regular expressions,
     * case matches etc, are compiled and all include rules are expanded.
     * We also compile the bracket definitions, supply defaults, and do many sanity checks.
     * If the 'jsonStrict' parameter is 'false', we allow at certain locations
     * regular expression objects and functions that get called during lexing.
     * (Currently we have no samples that need this so perhaps we should always have
     * jsonStrict to true).
     */
    function compile(languageId, json) {
        if (!json || typeof (json) !== 'object') {
            throw new Error('Monarch: expecting a language definition object');
        }
        // Create our lexer
        const lexer = {};
        lexer.languageId = languageId;
        lexer.includeLF = bool(json.includeLF, false);
        lexer.noThrow = false; // raise exceptions during compilation
        lexer.maxStack = 100;
        // Set standard fields: be defensive about types
        lexer.start = (typeof json.start === 'string' ? json.start : null);
        lexer.ignoreCase = bool(json.ignoreCase, false);
        lexer.unicode = bool(json.unicode, false);
        lexer.tokenPostfix = string(json.tokenPostfix, '.' + lexer.languageId);
        lexer.defaultToken = string(json.defaultToken, 'source');
        lexer.usesEmbedded = false; // becomes true if we find a nextEmbedded action
        // For calling compileAction later on
        const lexerMin = json;
        lexerMin.languageId = languageId;
        lexerMin.includeLF = lexer.includeLF;
        lexerMin.ignoreCase = lexer.ignoreCase;
        lexerMin.unicode = lexer.unicode;
        lexerMin.noThrow = lexer.noThrow;
        lexerMin.usesEmbedded = lexer.usesEmbedded;
        lexerMin.stateNames = json.tokenizer;
        lexerMin.defaultToken = lexer.defaultToken;
        // Compile an array of rules into newrules where RegExp objects are created.
        function addRules(state, newrules, rules) {
            for (const rule of rules) {
                let include = rule.include;
                if (include) {
                    if (typeof (include) !== 'string') {
                        throw monarchCommon.createError(lexer, 'an \'include\' attribute must be a string at: ' + state);
                    }
                    if (include[0] === '@') {
                        include = include.substr(1); // peel off starting @
                    }
                    if (!json.tokenizer[include]) {
                        throw monarchCommon.createError(lexer, 'include target \'' + include + '\' is not defined at: ' + state);
                    }
                    addRules(state + '.' + include, newrules, json.tokenizer[include]);
                }
                else {
                    const newrule = new Rule(state);
                    // Set up new rule attributes
                    if (Array.isArray(rule) && rule.length >= 1 && rule.length <= 3) {
                        newrule.setRegex(lexerMin, rule[0]);
                        if (rule.length >= 3) {
                            if (typeof (rule[1]) === 'string') {
                                newrule.setAction(lexerMin, { token: rule[1], next: rule[2] });
                            }
                            else if (typeof (rule[1]) === 'object') {
                                const rule1 = rule[1];
                                rule1.next = rule[2];
                                newrule.setAction(lexerMin, rule1);
                            }
                            else {
                                throw monarchCommon.createError(lexer, 'a next state as the last element of a rule can only be given if the action is either an object or a string, at: ' + state);
                            }
                        }
                        else {
                            newrule.setAction(lexerMin, rule[1]);
                        }
                    }
                    else {
                        if (!rule.regex) {
                            throw monarchCommon.createError(lexer, 'a rule must either be an array, or an object with a \'regex\' or \'include\' field at: ' + state);
                        }
                        if (rule.name) {
                            if (typeof rule.name === 'string') {
                                newrule.name = rule.name;
                            }
                        }
                        if (rule.matchOnlyAtStart) {
                            newrule.matchOnlyAtLineStart = bool(rule.matchOnlyAtLineStart, false);
                        }
                        newrule.setRegex(lexerMin, rule.regex);
                        newrule.setAction(lexerMin, rule.action);
                    }
                    newrules.push(newrule);
                }
            }
        }
        // compile the tokenizer rules
        if (!json.tokenizer || typeof (json.tokenizer) !== 'object') {
            throw monarchCommon.createError(lexer, 'a language definition must define the \'tokenizer\' attribute as an object');
        }
        lexer.tokenizer = [];
        for (const key in json.tokenizer) {
            if (json.tokenizer.hasOwnProperty(key)) {
                if (!lexer.start) {
                    lexer.start = key;
                }
                const rules = json.tokenizer[key];
                lexer.tokenizer[key] = new Array();
                addRules('tokenizer.' + key, lexer.tokenizer[key], rules);
            }
        }
        lexer.usesEmbedded = lexerMin.usesEmbedded; // can be set during compileAction
        // Set simple brackets
        if (json.brackets) {
            if (!(Array.isArray(json.brackets))) {
                throw monarchCommon.createError(lexer, 'the \'brackets\' attribute must be defined as an array');
            }
        }
        else {
            json.brackets = [
                { open: '{', close: '}', token: 'delimiter.curly' },
                { open: '[', close: ']', token: 'delimiter.square' },
                { open: '(', close: ')', token: 'delimiter.parenthesis' },
                { open: '<', close: '>', token: 'delimiter.angle' }
            ];
        }
        const brackets = [];
        for (const el of json.brackets) {
            let desc = el;
            if (desc && Array.isArray(desc) && desc.length === 3) {
                desc = { token: desc[2], open: desc[0], close: desc[1] };
            }
            if (desc.open === desc.close) {
                throw monarchCommon.createError(lexer, 'open and close brackets in a \'brackets\' attribute must be different: ' + desc.open +
                    '\n hint: use the \'bracket\' attribute if matching on equal brackets is required.');
            }
            if (typeof desc.open === 'string' && typeof desc.token === 'string' && typeof desc.close === 'string') {
                brackets.push({
                    token: desc.token + lexer.tokenPostfix,
                    open: monarchCommon.fixCase(lexer, desc.open),
                    close: monarchCommon.fixCase(lexer, desc.close)
                });
            }
            else {
                throw monarchCommon.createError(lexer, 'every element in the \'brackets\' array must be a \'{open,close,token}\' object or array');
            }
        }
        lexer.brackets = brackets;
        // Disable throw so the syntax highlighter goes, no matter what
        lexer.noThrow = true;
        return lexer;
    }
    exports.compile = compile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uYXJjaENvbXBpbGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9zdGFuZGFsb25lL2NvbW1vbi9tb25hcmNoL21vbmFyY2hDb21waWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRzs7Ozs7OztPQU9HO0lBRUgsU0FBUyxTQUFTLENBQUMsUUFBNkIsRUFBRSxHQUFRO1FBQ3pELElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNWLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzNCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUNELEtBQUssTUFBTSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDckIsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDO1FBQ0YsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELFNBQVMsSUFBSSxDQUFDLElBQVMsRUFBRSxRQUFpQjtRQUN6QyxJQUFJLE9BQU8sSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxTQUFTLE1BQU0sQ0FBQyxJQUFTLEVBQUUsUUFBZ0I7UUFDMUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDaEMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDakIsQ0FBQztJQUdELFNBQVMsV0FBVyxDQUFDLEtBQWU7UUFD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
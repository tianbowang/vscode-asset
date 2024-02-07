/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = void 0;
    var ChCode;
    (function (ChCode) {
        ChCode[ChCode["BOM"] = 65279] = "BOM";
        ChCode[ChCode["SPACE"] = 32] = "SPACE";
        ChCode[ChCode["TAB"] = 9] = "TAB";
        ChCode[ChCode["CARRIAGE_RETURN"] = 13] = "CARRIAGE_RETURN";
        ChCode[ChCode["LINE_FEED"] = 10] = "LINE_FEED";
        ChCode[ChCode["SLASH"] = 47] = "SLASH";
        ChCode[ChCode["LESS_THAN"] = 60] = "LESS_THAN";
        ChCode[ChCode["QUESTION_MARK"] = 63] = "QUESTION_MARK";
        ChCode[ChCode["EXCLAMATION_MARK"] = 33] = "EXCLAMATION_MARK";
    })(ChCode || (ChCode = {}));
    var State;
    (function (State) {
        State[State["ROOT_STATE"] = 0] = "ROOT_STATE";
        State[State["DICT_STATE"] = 1] = "DICT_STATE";
        State[State["ARR_STATE"] = 2] = "ARR_STATE";
    })(State || (State = {}));
    /**
     * A very fast plist parser
     */
    function parse(content) {
        return _parse(content, null, null);
    }
    exports.parse = parse;
    function _parse(content, filename, locationKeyName) {
        const len = content.length;
        let pos = 0;
        let line = 1;
        let char = 0;
        // Skip UTF8 BOM
        if (len > 0 && content.charCodeAt(0) === 65279 /* ChCode.BOM */) {
            pos = 1;
        }
        function advancePosBy(by) {
            if (locationKeyName === null) {
                pos = pos + by;
            }
            else {
                while (by > 0) {
                    const chCode = content.charCodeAt(pos);
                    if (chCode === 10 /* ChCode.LINE_FEED */) {
                        pos++;
                        line++;
                        char = 0;
                    }
                    else {
                        pos++;
                        char++;
                    }
                    by--;
                }
            }
        }
        function advancePosTo(to) {
            if (locationKeyName === null) {
                pos = to;
            }
            else {
                advancePosBy(to - pos);
            }
        }
        function skipWhitespace() {
            while (pos < len) {
                const chCode = content.charCodeAt(pos);
                if (chCode !== 32 /* ChCode.SPACE */ && chCode !== 9 /* ChCode.TAB */ && chCode !== 13 /* ChCode.CARRIAGE_RETURN */ && chCode !== 10 /* ChCode.LINE_FEED */) {
                    break;
                }
                advancePosBy(1);
            }
        }
        function advanceIfStartsWith(str) {
            if (content.substr(pos, str.length) === str) {
                advancePosBy(str.length);
                return true;
            }
            return false;
        }
        function advanceUntil(str) {
            const nextOccurence = content.indexOf(str, pos);
            if (nextOccurence !== -1) {
                advancePosTo(nextOccurence + str.length);
            }
            else {
                // EOF
                advancePosTo(len);
            }
        }
        function captureUntil(str) {
            const nextOccurence = content.indexOf(str, pos);
            if (nextOccurence !== -1) {
                const r = content.substring(pos, nextOccurence);
                advancePosTo(nextOccurence + str.length);
                return r;
            }
            else {
                // EOF
                const r = content.substr(pos);
                advancePosTo(len);
                return r;
            }
        }
        let state = 0 /* State.ROOT_STATE */;
        let cur = null;
        const stateStack = [];
        const objStack = [];
        let curKey = null;
        function pushState(newState, newCur) {
            stateStack.push(state);
            objStack.push(cur);
            state = newState;
            cur = newCur;
        }
        function popState() {
            if (stateStack.length === 0) {
                return fail('illegal state stack');
            }
            state = stateStack.pop();
            cur = objStack.pop();
        }
        function fail(msg) {
            throw new Error('Near offset ' + pos + ': ' + msg + ' ~~~' + content.substr(pos, 50) + '~~~');
        }
        const dictState = {
            enterDict: function () {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                const newDict = {};
                if (locationKeyName !== null) {
                    newDict[locationKeyName] = {
                        filename: filename,
                        line: line,
                        char: char
                    };
                }
                cur[curKey] = newDict;
                curKey = null;
                pushState(1 /* State.DICT_STATE */, newDict);
            },
            enterArray: function () {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                const newArr = [];
                cur[curKey] = newArr;
                curKey = null;
                pushState(2 /* State.ARR_STATE */, newArr);
            }
        };
        const arrState = {
            enterDict: function () {
                const newDict = {};
                if (locationKeyName !== null) {
                    newDict[locationKeyName] = {
                        filename: filename,
                        line: line,
                        char: char
                    };
                }
                cur.push(newDict);
                pushState(1 /* State.DICT_STATE */, newDict);
            },
            enterArray: function () {
                const newArr = [];
                cur.push(newArr);
                pushState(2 /* State.ARR_STATE */, newArr);
            }
        };
        function enterDict() {
            if (state === 1 /* State.DICT_STATE */) {
                dictState.enterDict();
            }
            else if (state === 2 /* State.ARR_STATE */) {
                arrState.enterDict();
            }
            else { // ROOT_STATE
                cur = {};
                if (locationKeyName !== null) {
                    cur[locationKeyName] = {
                        filename: filename,
                        line: line,
                        char: char
                    };
                }
                pushState(1 /* State.DICT_STATE */, cur);
            }
        }
        function leaveDict() {
            if (state === 1 /* State.DICT_STATE */) {
                popState();
            }
            else if (state === 2 /* State.ARR_STATE */) {
                return fail('unexpected </dict>');
            }
            else { // ROOT_STATE
                return fail('unexpected </dict>');
            }
        }
        function enterArray() {
            if (state === 1 /* State.DICT_STATE */) {
                dictState.enterArray();
            }
            else if (state === 2 /* State.ARR_STATE */) {
                arrState.enterArray();
            }
            else { // ROOT_STATE
                cur = [];
                pushState(2 /* State.ARR_STATE */, cur);
            }
        }
        function leaveArray() {
            if (state === 1 /* State.DICT_STATE */) {
                return fail('unexpected </array>');
            }
            else if (state === 2 /* State.ARR_STATE */) {
                popState();
            }
            else { // ROOT_STATE
                return fail('unexpected </array>');
            }
        }
        function acceptKey(val) {
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey !== null) {
                    return fail('too many <key>');
                }
                curKey = val;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                return fail('unexpected <key>');
            }
            else { // ROOT_STATE
                return fail('unexpected <key>');
            }
        }
        function acceptString(val) {
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function acceptReal(val) {
            if (isNaN(val)) {
                return fail('cannot parse float');
            }
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function acceptInteger(val) {
            if (isNaN(val)) {
                return fail('cannot parse integer');
            }
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function acceptDate(val) {
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function acceptData(val) {
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function acceptBool(val) {
            if (state === 1 /* State.DICT_STATE */) {
                if (curKey === null) {
                    return fail('missing <key>');
                }
                cur[curKey] = val;
                curKey = null;
            }
            else if (state === 2 /* State.ARR_STATE */) {
                cur.push(val);
            }
            else { // ROOT_STATE
                cur = val;
            }
        }
        function escapeVal(str) {
            return str.replace(/&#([0-9]+);/g, function (_, m0) {
                return String.fromCodePoint(parseInt(m0, 10));
            }).replace(/&#x([0-9a-f]+);/g, function (_, m0) {
                return String.fromCodePoint(parseInt(m0, 16));
            }).replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, function (_) {
                switch (_) {
                    case '&amp;': return '&';
                    case '&lt;': return '<';
                    case '&gt;': return '>';
                    case '&quot;': return '"';
                    case '&apos;': return '\'';
                }
                return _;
            });
        }
        function parseOpenTag() {
            let r = captureUntil('>');
            let isClosed = false;
            if (r.charCodeAt(r.length - 1) === 47 /* ChCode.SLASH */) {
                isClosed = true;
                r = r.substring(0, r.length - 1);
            }
            return {
                name: r.trim(),
                isClosed: isClosed
            };
        }
        function parseTagValue(tag) {
            if (tag.isClosed) {
                return '';
            }
            const val = captureUntil('</');
            advanceUntil('>');
            return escapeVal(val);
        }
        while (pos < len) {
            skipWhitespace();
            if (pos >= len) {
                break;
            }
            const chCode = content.charCodeAt(pos);
            advancePosBy(1);
            if (chCode !== 60 /* ChCode.LESS_THAN */) {
                return fail('expected <');
            }
            if (pos >= len) {
                return fail('unexpected end of input');
            }
            const peekChCode = content.charCodeAt(pos);
            if (peekChCode === 63 /* ChCode.QUESTION_MARK */) {
                advancePosBy(1);
                advanceUntil('?>');
                continue;
            }
            if (peekChCode === 33 /* ChCode.EXCLAMATION_MARK */) {
                advancePosBy(1);
                if (advanceIfStartsWith('--')) {
                    advanceUntil('-->');
                    continue;
                }
                advanceUntil('>');
                continue;
            }
            if (peekChCode === 47 /* ChCode.SLASH */) {
                advancePosBy(1);
                skipWhitespace();
                if (advanceIfStartsWith('plist')) {
                    advanceUntil('>');
                    continue;
                }
                if (advanceIfStartsWith('dict')) {
                    advanceUntil('>');
                    leaveDict();
                    continue;
                }
                if (advanceIfStartsWith('array')) {
                    advanceUntil('>');
                    leaveArray();
                    continue;
                }
                return fail('unexpected closed tag');
            }
            const tag = parseOpenTag();
            switch (tag.name) {
                case 'dict':
                    enterDict();
                    if (tag.isClosed) {
                        leaveDict();
                    }
                    continue;
                case 'array':
                    enterArray();
                    if (tag.isClosed) {
                        leaveArray();
                    }
                    continue;
                case 'key':
                    acceptKey(parseTagValue(tag));
                    continue;
                case 'string':
                    acceptString(parseTagValue(tag));
                    continue;
                case 'real':
                    acceptReal(parseFloat(parseTagValue(tag)));
                    continue;
                case 'integer':
                    acceptInteger(parseInt(parseTagValue(tag), 10));
                    continue;
                case 'date':
                    acceptDate(new Date(parseTagValue(tag)));
                    continue;
                case 'data':
                    acceptData(parseTagValue(tag));
                    continue;
                case 'true':
                    parseTagValue(tag);
                    acceptBool(true);
                    continue;
                case 'false':
                    parseTagValue(tag);
                    acceptBool(false);
                    continue;
            }
            if (/^plist/.test(tag.name)) {
                continue;
            }
            return fail('unexpected opened tag ' + tag.name);
        }
        return cur;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxpc3RQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90aGVtZXMvY29tbW9uL3BsaXN0UGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUVoRyxJQUFXLE1BYVY7SUFiRCxXQUFXLE1BQU07UUFDaEIscUNBQVcsQ0FBQTtRQUVYLHNDQUFVLENBQUE7UUFDVixpQ0FBTyxDQUFBO1FBQ1AsMERBQW9CLENBQUE7UUFDcEIsOENBQWMsQ0FBQTtRQUVkLHNDQUFVLENBQUE7UUFFViw4Q0FBYyxDQUFBO1FBQ2Qsc0RBQWtCLENBQUE7UUFDbEIsNERBQXFCLENBQUE7SUFDdEIsQ0FBQyxFQWJVLE1BQU0sS0FBTixNQUFNLFFBYWhCO0lBRUQsSUFBVyxLQUlWO0lBSkQsV0FBVyxLQUFLO1FBQ2YsNkNBQWMsQ0FBQTtRQUNkLDZDQUFjLENBQUE7UUFDZCwyQ0FBYSxDQUFBO0lBQ2QsQ0FBQyxFQUpVLEtBQUssS0FBTCxLQUFLLFFBSWY7SUFDRDs7T0FFRztJQUNILFNBQWdCLEtBQUssQ0FBQyxPQUFlO1FBQ3BDLE9BQU8sTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUZELHNCQUVDO0lBRUQsU0FBUyxNQUFNLENBQUMsT0FBZSxFQUFFLFFBQXVCLEVBQUUsZUFBOEI7UUFDdkYsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUUzQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDWixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7UUFDYixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7UUFFYixnQkFBZ0I7UUFDaEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLDJC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
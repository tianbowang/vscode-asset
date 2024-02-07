(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/characterClassifier"], function (require, exports, characterClassifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeLinks = exports.LinkComputer = exports.StateMachine = exports.State = void 0;
    var State;
    (function (State) {
        State[State["Invalid"] = 0] = "Invalid";
        State[State["Start"] = 1] = "Start";
        State[State["H"] = 2] = "H";
        State[State["HT"] = 3] = "HT";
        State[State["HTT"] = 4] = "HTT";
        State[State["HTTP"] = 5] = "HTTP";
        State[State["F"] = 6] = "F";
        State[State["FI"] = 7] = "FI";
        State[State["FIL"] = 8] = "FIL";
        State[State["BeforeColon"] = 9] = "BeforeColon";
        State[State["AfterColon"] = 10] = "AfterColon";
        State[State["AlmostThere"] = 11] = "AlmostThere";
        State[State["End"] = 12] = "End";
        State[State["Accept"] = 13] = "Accept";
        State[State["LastKnownState"] = 14] = "LastKnownState"; // marker, custom states may follow
    })(State || (exports.State = State = {}));
    class Uint8Matrix {
        constructor(rows, cols, defaultValue) {
            const data = new Uint8Array(rows * cols);
            for (let i = 0, len = rows * cols; i < len; i++) {
                data[i] = defaultValue;
            }
            this._data = data;
            this.rows = rows;
            this.cols = cols;
        }
        get(row, col) {
            return this._data[row * this.cols + col];
        }
        set(row, col, value) {
            this._data[row * this.cols + col] = value;
        }
    }
    class StateMachine {
        constructor(edges) {
            let maxCharCode = 0;
            let maxState = 0 /* State.Invalid */;
            for (let i = 0, len = edges.length; i < len; i++) {
                const [from, chCode, to] = edges[i];
                if (chCode > maxCharCode) {
                    maxCharCode = chCode;
                }
                if (from > maxState) {
                    maxState = from;
                }
                if (to > maxState) {
                    maxState = to;
                }
            }
            maxCharCode++;
            maxState++;
            const states = new Uint8Matrix(maxState, maxCharCode, 0 /* State.Invalid */);
            for (let i = 0, len = edges.length; i < len; i++) {
                const [from, chCode, to] = edges[i];
                states.set(from, chCode, to);
            }
            this._states = states;
            this._maxCharCode = maxCharCode;
        }
        nextState(currentState, chCode) {
            if (chCode < 0 || chCode >= this._maxCharCode) {
                return 0 /* State.Invalid */;
            }
            return this._states.get(currentState, chCode);
        }
    }
    exports.StateMachine = StateMachine;
    // State machine for http:// or https:// or file://
    let _stateMachine = null;
    function getStateMachine() {
        if (_stateMachine === null) {
            _stateMachine = new StateMachine([
                [1 /* State.Start */, 104 /* CharCode.h */, 2 /* State.H */],
                [1 /* State.Start */, 72 /* CharCode.H */, 2 /* State.H */],
                [1 /* State.Start */, 102 /* CharCode.f */, 6 /* State.F */],
                [1 /* State.Start */, 70 /* CharCode.F */, 6 /* State.F */],
                [2 /* State.H */, 116 /* CharCode.t */, 3 /* State.HT */],
                [2 /* State.H */, 84 /* CharCode.T */, 3 /* State.HT */],
                [3 /* State.HT */, 116 /* CharCode.t */, 4 /* State.HTT */],
                [3 /* State.HT */, 84 /* CharCode.T */, 4 /* State.HTT */],
                [4 /* State.HTT */, 112 /* CharCode.p */, 5 /* State.HTTP */],
                [4 /* State.HTT */, 80 /* CharCode.P */, 5 /* State.HTTP */],
                [5 /* State.HTTP */, 115 /* CharCode.s */, 9 /* State.BeforeColon */],
                [5 /* State.HTTP */, 83 /* CharCode.S */, 9 /* State.BeforeColon */],
                [5 /* State.HTTP */, 58 /* CharCode.Colon */, 10 /* State.AfterColon */],
                [6 /* State.F */, 105 /* CharCode.i */, 7 /* State.FI */],
                [6 /* State.F */, 73 /* CharCode.I */, 7 /* State.FI */],
                [7 /* State.FI */, 108 /* CharCode.l */, 8 /* State.FIL */],
                [7 /* State.FI */, 76 /* CharCode.L */, 8 /* State.FIL */],
                [8 /* State.FIL */, 101 /* CharCode.e */, 9 /* State.BeforeColon */],
                [8 /* State.FIL */, 69 /* CharCode.E */, 9 /* State.BeforeColon */],
                [9 /* State.BeforeColon */, 58 /* CharCode.Colon */, 10 /* State.AfterColon */],
                [10 /* State.AfterColon */, 47 /* CharCode.Slash */, 11 /* State.AlmostThere */],
                [11 /* State.AlmostThere */, 47 /* CharCode.Slash */, 12 /* State.End */],
            ]);
        }
        return _stateMachine;
    }
    var CharacterClass;
    (function (CharacterClass) {
        CharacterClass[CharacterClass["None"] = 0] = "None";
        CharacterClass[CharacterClass["ForceTermination"] = 1] = "ForceTermination";
        CharacterClass[CharacterClass["CannotEndIn"] = 2] = "CannotEndIn";
    })(CharacterClass || (CharacterClass = {}));
    let _classifier = null;
    function getClassifier() {
        if (_classifier === null) {
            _classifier = new characterClassifier_1.CharacterClassifier(0 /* CharacterClass.None */);
            // allow-any-unicode-next-line
            const FORCE_TERMINATION_CHARACTERS = ' \t<>\'\"、。｡､，．：；‘〈「『〔（［｛｢｣｝］）〕』」〉’｀～…';
            for (let i = 0; i < FORCE_TERMINATION_CHARACTERS.length; i++) {
                _classifier.set(FORCE_TERMINATION_CHARACTERS.charCodeAt(i), 1 /* CharacterClass.ForceTermination */);
            }
            const CANNOT_END_WITH_CHARACTERS = '.,;:';
            for (let i = 0; i < CANNOT_END_WITH_CHARACTERS.length; i++) {
                _classifier.set(CANNOT_END_WITH_CHARACTERS.charCodeAt(i), 2 /* CharacterClass.CannotEndIn */);
            }
        }
        return _classifier;
    }
    class LinkComputer {
        static _createLink(classifier, line, lineNumber, linkBeginIndex, linkEndIndex) {
            // Do not allow to end link in certain characters...
            let lastIncludedCharIndex = linkEndIndex - 1;
            do {
                const chCode = line.charCodeAt(lastIncludedCharIndex);
                const chClass = classifier.get(chCode);
                if (chClass !== 2 /* CharacterClass.CannotEndIn */) {
                    break;
                }
                lastIncludedCharIndex--;
            } while (lastIncludedCharIndex > linkBeginIndex);
            // Handle links enclosed in parens, square brackets and curlys.
            if (linkBeginIndex > 0) {
                const charCodeBeforeLink = line.charCodeAt(linkBeginIndex - 1);
                const lastCharCodeInLink = line.charCodeAt(lastIncludedCharIndex);
                if ((charCodeBeforeLink === 40 /* CharCode.OpenParen */ && lastCharCodeInLink === 41 /* CharCode.CloseParen */)
                    || (charCodeBeforeLink === 91 /* CharCode.OpenSquareBracket */ && lastCharCodeInLink === 93 /* CharCode.CloseSquareBracket */)
                    || (charCodeBeforeLink === 123 /* CharCode.OpenCurlyBrace */ && lastCharCodeInLink === 125 /* CharCode.CloseCurlyBrace */)) {
                    // Do not end in ) if ( is before the link start
                    // Do not end in ] if [ is before the link start
                    // Do not end in } if { is before the link start
                    lastIncludedCharIndex--;
                }
            }
            return {
                range: {
                    startLineNumber: lineNumber,
                    startColumn: linkBeginIndex + 1,
                    endLineNumber: lineNumber,
                    endColumn: lastIncludedCharIndex + 2
                },
                url: line.substring(linkBeginIndex, lastIncludedCharIndex + 1)
            };
        }
        static computeLinks(model, stateMachine = getStateMachine()) {
            const classifier = getClassifier();
            const result = [];
            for (let i = 1, lineCount = model.getLineCount(); i <= lineCount; i++) {
                const line = model.getLineContent(i);
                const len = line.length;
                let j = 0;
                let linkBeginIndex = 0;
                let linkBeginChCode = 0;
                let state = 1 /* State.Start */;
                let hasOpenParens = false;
                let hasOpenSquareBracket = false;
                let inSquareBrackets = false;
                let hasOpenCurlyBracket = false;
                while (j < len) {
                    let resetStateMachine = false;
                    const chCode = line.charCodeAt(j);
                    if (state === 13 /* State.Accept */) {
                        let chClass;
                        switch (chCode) {
                            case 40 /* CharCode.OpenParen */:
                                hasOpenParens = true;
                                chClass = 0 /* CharacterClass.None */;
                                break;
                            case 41 /* CharCode.CloseParen */:
                                chClass = (hasOpenParens ? 0 /* CharacterClass.None */ : 1 /* CharacterClass.ForceTermination */);
                                break;
                            case 91 /* CharCode.OpenSquareBracket */:
                                inSquareBrackets = true;
                                hasOpenSquareBracket = true;
                                chClass = 0 /* CharacterClass.None */;
                                break;
                            case 93 /* CharCode.CloseSquareBracket */:
                                inSquareBrackets = false;
                                chClass = (hasOpenSquareBracket ? 0 /* CharacterClass.None */ : 1 /* CharacterClass.ForceTermination */);
                                break;
                            case 123 /* CharCode.OpenCurlyBrace */:
                                hasOpenCurlyBracket = true;
                                chClass = 0 /* CharacterClass.None */;
                                break;
                            case 125 /* CharCode.CloseCurlyBrace */:
                                chClass = (hasOpenCurlyBracket ? 0 /* CharacterClass.None */ : 1 /* CharacterClass.ForceTermination */);
                                break;
                            // The following three rules make it that ' or " or ` are allowed inside links
                            // only if the link is wrapped by some other quote character
                            case 39 /* CharCode.SingleQuote */:
                            case 34 /* CharCode.DoubleQuote */:
                            case 96 /* CharCode.BackTick */:
                                if (linkBeginChCode === chCode) {
                                    chClass = 1 /* CharacterClass.ForceTermination */;
                                }
                                else if (linkBeginChCode === 39 /* CharCode.SingleQuote */ || linkBeginChCode === 34 /* CharCode.DoubleQuote */ || linkBeginChCode === 96 /* CharCode.BackTick */) {
                                    chClass = 0 /* CharacterClass.None */;
                                }
                                else {
                                    chClass = 1 /* CharacterClass.ForceTermination */;
                                }
                                break;
                            case 42 /* CharCode.Asterisk */:
                                // `*` terminates a link if the link began with `*`
                                chClass = (linkBeginChCode === 42 /* CharCode.Asterisk */) ? 1 /* CharacterClass.ForceTermination */ : 0 /* CharacterClass.None */;
                                break;
                            case 124 /* CharCode.Pipe */:
                                // `|` terminates a link if the link began with `|`
                                chClass = (linkBeginChCode === 124 /* CharCode.Pipe */) ? 1 /* CharacterClass.ForceTermination */ : 0 /* CharacterClass.None */;
                                break;
                            case 32 /* CharCode.Space */:
                                // ` ` allow space in between [ and ]
                                chClass = (inSquareBrackets ? 0 /* CharacterClass.None */ : 1 /* CharacterClass.ForceTermination */);
                                break;
                            default:
                                chClass = classifier.get(chCode);
                        }
                        // Check if character terminates link
                        if (chClass === 1 /* CharacterClass.ForceTermination */) {
                            result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, j));
                            resetStateMachine = true;
                        }
                    }
                    else if (state === 12 /* State.End */) {
                        let chClass;
                        if (chCode === 91 /* CharCode.OpenSquareBracket */) {
                            // Allow for the authority part to contain ipv6 addresses which contain [ and ]
                            hasOpenSquareBracket = true;
                            chClass = 0 /* CharacterClass.None */;
                        }
                        else {
                            chClass = classifier.get(chCode);
                        }
                        // Check if character terminates link
                        if (chClass === 1 /* CharacterClass.ForceTermination */) {
                            resetStateMachine = true;
                        }
                        else {
                            state = 13 /* State.Accept */;
                        }
                    }
                    else {
                        state = stateMachine.nextState(state, chCode);
                        if (state === 0 /* State.Invalid */) {
                            resetStateMachine = true;
                        }
                    }
                    if (resetStateMachine) {
                        state = 1 /* State.Start */;
                        hasOpenParens = false;
                        hasOpenSquareBracket = false;
                        hasOpenCurlyBracket = false;
                        // Record where the link started
                        linkBeginIndex = j + 1;
                        linkBeginChCode = chCode;
                    }
                    j++;
                }
                if (state === 13 /* State.Accept */) {
                    result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, len));
                }
            }
            return result;
        }
    }
    exports.LinkComputer = LinkComputer;
    /**
     * Returns an array of all links contains in the provided
     * document. *Note* that this operation is computational
     * expensive and should not run in the UI thread.
     */
    function computeLinks(model) {
        if (!model || typeof model.getLineCount !== 'function' || typeof model.getLineContent !== 'function') {
            // Unknown caller!
            return [];
        }
        return LinkComputer.computeLinks(model);
    }
    exports.computeLinks = computeLinks;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua0NvbXB1dGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2xhbmd1YWdlcy9saW5rQ29tcHV0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLElBQWtCLEtBZ0JqQjtJQWhCRCxXQUFrQixLQUFLO1FBQ3RCLHVDQUFXLENBQUE7UUFDWCxtQ0FBUyxDQUFBO1FBQ1QsMkJBQUssQ0FBQTtRQUNMLDZCQUFNLENBQUE7UUFDTiwrQkFBTyxDQUFBO1FBQ1AsaUNBQVEsQ0FBQTtRQUNSLDJCQUFLLENBQUE7UUFDTCw2QkFBTSxDQUFBO1FBQ04sK0JBQU8sQ0FBQTtRQUNQLCtDQUFlLENBQUE7UUFDZiw4Q0FBZSxDQUFBO1FBQ2YsZ0RBQWdCLENBQUE7UUFDaEIsZ0NBQVEsQ0FBQTtRQUNSLHNDQUFXLENBQUE7UUFDWCxzREFBbUIsQ0FBQSxDQUFDLG1DQUFtQztJQUN4RCxDQUFDLEVBaEJpQixLQUFLLHFCQUFMLEtBQUssUUFnQnRCO0lBSUQsTUFBTSxXQUFXO1FBTWhCLFlBQVksSUFBWSxFQUFFLElBQVksRUFBRSxZQUFvQjtZQUMzRCxNQUFNLElBQUksR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDekMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNqRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDO1lBQ3hCLENBQUM7WUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUks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
//# sourceURL=../../../vs/editor/common/languages/linkComputer.js
})
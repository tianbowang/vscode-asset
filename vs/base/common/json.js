(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNodeType = exports.stripComments = exports.visit = exports.findNodeAtOffset = exports.contains = exports.getNodeValue = exports.getNodePath = exports.findNodeAtLocation = exports.parseTree = exports.parse = exports.getLocation = exports.createScanner = exports.ParseOptions = exports.ParseErrorCode = exports.SyntaxKind = exports.ScanError = void 0;
    var ScanError;
    (function (ScanError) {
        ScanError[ScanError["None"] = 0] = "None";
        ScanError[ScanError["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
        ScanError[ScanError["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
        ScanError[ScanError["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
        ScanError[ScanError["InvalidUnicode"] = 4] = "InvalidUnicode";
        ScanError[ScanError["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
        ScanError[ScanError["InvalidCharacter"] = 6] = "InvalidCharacter";
    })(ScanError || (exports.ScanError = ScanError = {}));
    var SyntaxKind;
    (function (SyntaxKind) {
        SyntaxKind[SyntaxKind["OpenBraceToken"] = 1] = "OpenBraceToken";
        SyntaxKind[SyntaxKind["CloseBraceToken"] = 2] = "CloseBraceToken";
        SyntaxKind[SyntaxKind["OpenBracketToken"] = 3] = "OpenBracketToken";
        SyntaxKind[SyntaxKind["CloseBracketToken"] = 4] = "CloseBracketToken";
        SyntaxKind[SyntaxKind["CommaToken"] = 5] = "CommaToken";
        SyntaxKind[SyntaxKind["ColonToken"] = 6] = "ColonToken";
        SyntaxKind[SyntaxKind["NullKeyword"] = 7] = "NullKeyword";
        SyntaxKind[SyntaxKind["TrueKeyword"] = 8] = "TrueKeyword";
        SyntaxKind[SyntaxKind["FalseKeyword"] = 9] = "FalseKeyword";
        SyntaxKind[SyntaxKind["StringLiteral"] = 10] = "StringLiteral";
        SyntaxKind[SyntaxKind["NumericLiteral"] = 11] = "NumericLiteral";
        SyntaxKind[SyntaxKind["LineCommentTrivia"] = 12] = "LineCommentTrivia";
        SyntaxKind[SyntaxKind["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
        SyntaxKind[SyntaxKind["LineBreakTrivia"] = 14] = "LineBreakTrivia";
        SyntaxKind[SyntaxKind["Trivia"] = 15] = "Trivia";
        SyntaxKind[SyntaxKind["Unknown"] = 16] = "Unknown";
        SyntaxKind[SyntaxKind["EOF"] = 17] = "EOF";
    })(SyntaxKind || (exports.SyntaxKind = SyntaxKind = {}));
    var ParseErrorCode;
    (function (ParseErrorCode) {
        ParseErrorCode[ParseErrorCode["InvalidSymbol"] = 1] = "InvalidSymbol";
        ParseErrorCode[ParseErrorCode["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
        ParseErrorCode[ParseErrorCode["PropertyNameExpected"] = 3] = "PropertyNameExpected";
        ParseErrorCode[ParseErrorCode["ValueExpected"] = 4] = "ValueExpected";
        ParseErrorCode[ParseErrorCode["ColonExpected"] = 5] = "ColonExpected";
        ParseErrorCode[ParseErrorCode["CommaExpected"] = 6] = "CommaExpected";
        ParseErrorCode[ParseErrorCode["CloseBraceExpected"] = 7] = "CloseBraceExpected";
        ParseErrorCode[ParseErrorCode["CloseBracketExpected"] = 8] = "CloseBracketExpected";
        ParseErrorCode[ParseErrorCode["EndOfFileExpected"] = 9] = "EndOfFileExpected";
        ParseErrorCode[ParseErrorCode["InvalidCommentToken"] = 10] = "InvalidCommentToken";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
        ParseErrorCode[ParseErrorCode["InvalidUnicode"] = 14] = "InvalidUnicode";
        ParseErrorCode[ParseErrorCode["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
        ParseErrorCode[ParseErrorCode["InvalidCharacter"] = 16] = "InvalidCharacter";
    })(ParseErrorCode || (exports.ParseErrorCode = ParseErrorCode = {}));
    var ParseOptions;
    (function (ParseOptions) {
        ParseOptions.DEFAULT = {
            allowTrailingComma: true
        };
    })(ParseOptions || (exports.ParseOptions = ParseOptions = {}));
    /**
     * Creates a JSON scanner on the given text.
     * If ignoreTrivia is set, whitespaces or comments are ignored.
     */
    function createScanner(text, ignoreTrivia = false) {
        let pos = 0;
        const len = text.length;
        let value = '';
        let tokenOffset = 0;
        let token = 16 /* SyntaxKind.Unknown */;
        let scanError = 0 /* ScanError.None */;
        function scanHexDigits(count) {
            let digits = 0;
            let hexValue = 0;
            while (digits < count) {
                const ch = text.charCodeAt(pos);
                if (ch >= 48 /* CharacterCodes._0 */ && ch <= 57 /* CharacterCodes._9 */) {
                    hexValue = hexValue * 16 + ch - 48 /* CharacterCodes._0 */;
                }
                else if (ch >= 65 /* CharacterCodes.A */ && ch <= 70 /* CharacterCodes.F */) {
                    hexValue = hexValue * 16 + ch - 65 /* CharacterCodes.A */ + 10;
                }
                else if (ch >= 97 /* CharacterCodes.a */ && ch <= 102 /* CharacterCodes.f */) {
                    hexValue = hexValue * 16 + ch - 97 /* CharacterCodes.a */ + 10;
                }
                else {
                    break;
                }
                pos++;
                digits++;
            }
            if (digits < count) {
                hexValue = -1;
            }
            return hexValue;
        }
        function setPosition(newPosition) {
            pos = newPosition;
            value = '';
            tokenOffset = 0;
            token = 16 /* SyntaxKind.Unknown */;
            scanError = 0 /* ScanError.None */;
        }
        function scanNumber() {
            const start = pos;
            if (text.charCodeAt(pos) === 48 /* CharacterCodes._0 */) {
                pos++;
            }
            else {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
            }
            if (pos < text.length && text.charCodeAt(pos) === 46 /* CharacterCodes.dot */) {
                pos++;
                if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                    while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                        pos++;
                    }
                }
                else {
                    scanError = 3 /* ScanError.UnexpectedEndOfNumber */;
                    return text.substring(start, pos);
                }
            }
            let end = pos;
            if (pos < text.length && (text.charCodeAt(pos) === 69 /* CharacterCodes.E */ || text.charCodeAt(pos) === 101 /* CharacterCodes.e */)) {
                pos++;
                if (pos < text.length && text.charCodeAt(pos) === 43 /* CharacterCodes.plus */ || text.charCodeAt(pos) === 45 /* CharacterCodes.minus */) {
                    pos++;
                }
                if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                    while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                        pos++;
                    }
                    end = pos;
                }
                else {
                    scanError = 3 /* ScanError.UnexpectedEndOfNumber */;
                }
            }
            return text.substring(start, end);
        }
        function scanString() {
            let result = '', start = pos;
            while (true) {
                if (pos >= len) {
                    result += text.substring(start, pos);
                    scanError = 2 /* ScanError.UnexpectedEndOfString */;
                    break;
                }
                const ch = text.charCodeAt(pos);
                if (ch === 34 /* CharacterCodes.doubleQuote */) {
                    result += text.substring(start, pos);
                    pos++;
                    break;
                }
                if (ch === 92 /* CharacterCodes.backslash */) {
                    result += text.substring(start, pos);
                    pos++;
                    if (pos >= len) {
                        scanError = 2 /* ScanError.UnexpectedEndOfString */;
                        break;
                    }
                    const ch2 = text.charCodeAt(pos++);
                    switch (ch2) {
                        case 34 /* CharacterCodes.doubleQuote */:
                            result += '\"';
                            break;
                        case 92 /* CharacterCodes.backslash */:
                            result += '\\';
                            break;
                        case 47 /* CharacterCodes.slash */:
                            result += '/';
                            break;
                        case 98 /* CharacterCodes.b */:
                            result += '\b';
                            break;
                        case 102 /* CharacterCodes.f */:
                            result += '\f';
                            break;
                        case 110 /* CharacterCodes.n */:
                            result += '\n';
                            break;
                        case 114 /* CharacterCodes.r */:
                            result += '\r';
                            break;
                        case 116 /* CharacterCodes.t */:
                            result += '\t';
                            break;
                        case 117 /* CharacterCodes.u */: {
                            const ch3 = scanHexDigits(4);
                            if (ch3 >= 0) {
                                result += String.fromCharCode(ch3);
                            }
                            else {
                                scanError = 4 /* ScanError.InvalidUnicode */;
                            }
                            break;
                        }
                        default:
                            scanError = 5 /* ScanError.InvalidEscapeCharacter */;
                    }
                    start = pos;
                    continue;
                }
                if (ch >= 0 && ch <= 0x1F) {
                    if (isLineBreak(ch)) {
                        result += text.substring(start, pos);
                        scanError = 2 /* ScanError.UnexpectedEndOfString */;
                        break;
                    }
                    else {
                        scanError = 6 /* ScanError.InvalidCharacter */;
                        // mark as error but continue with string
                    }
                }
                pos++;
            }
            return result;
        }
        function scanNext() {
            value = '';
            scanError = 0 /* ScanError.None */;
            tokenOffset = pos;
            if (pos >= len) {
                // at the end
                tokenOffset = len;
                return token = 17 /* SyntaxKind.EOF */;
            }
            let code = text.charCodeAt(pos);
            // trivia: whitespace
            if (isWhitespace(code)) {
                do {
                    pos++;
                    value += String.fromCharCode(code);
                    code = text.charCodeAt(pos);
                } while (isWhitespace(code));
                return token = 15 /* SyntaxKind.Trivia */;
            }
            // trivia: newlines
            if (isLineBreak(code)) {
                pos++;
                value += String.fromCharCode(code);
                if (code === 13 /* CharacterCodes.carriageReturn */ && text.charCodeAt(pos) === 10 /* CharacterCodes.lineFeed */) {
                    pos++;
                    value += '\n';
                }
                return token = 14 /* SyntaxKind.LineBreakTrivia */;
            }
            switch (code) {
                // tokens: []{}:,
                case 123 /* CharacterCodes.openBrace */:
                    pos++;
                    return token = 1 /* SyntaxKind.OpenBraceToken */;
                case 125 /* CharacterCodes.closeBrace */:
                    pos++;
                    return token = 2 /* SyntaxKind.CloseBraceToken */;
                case 91 /* CharacterCodes.openBracket */:
                    pos++;
                    return token = 3 /* SyntaxKind.OpenBracketToken */;
                case 93 /* CharacterCodes.closeBracket */:
                    pos++;
                    return token = 4 /* SyntaxKind.CloseBracketToken */;
                case 58 /* CharacterCodes.colon */:
                    pos++;
                    return token = 6 /* SyntaxKind.ColonToken */;
                case 44 /* CharacterCodes.comma */:
                    pos++;
                    return token = 5 /* SyntaxKind.CommaToken */;
                // strings
                case 34 /* CharacterCodes.doubleQuote */:
                    pos++;
                    value = scanString();
                    return token = 10 /* SyntaxKind.StringLiteral */;
                // comments
                case 47 /* CharacterCodes.slash */: {
                    const start = pos - 1;
                    // Single-line comment
                    if (text.charCodeAt(pos + 1) === 47 /* CharacterCodes.slash */) {
                        pos += 2;
                        while (pos < len) {
                            if (isLineBreak(text.charCodeAt(pos))) {
                                break;
                            }
                            pos++;
                        }
                        value = text.substring(start, pos);
                        return token = 12 /* SyntaxKind.LineCommentTrivia */;
                    }
                    // Multi-line comment
                    if (text.charCodeAt(pos + 1) === 42 /* CharacterCodes.asterisk */) {
                        pos += 2;
                        const safeLength = len - 1; // For lookahead.
                        let commentClosed = false;
                        while (pos < safeLength) {
                            const ch = text.charCodeAt(pos);
                            if (ch === 42 /* CharacterCodes.asterisk */ && text.charCodeAt(pos + 1) === 47 /* CharacterCodes.slash */) {
                                pos += 2;
                                commentClosed = true;
                                break;
                            }
                            pos++;
                        }
                        if (!commentClosed) {
                            pos++;
                            scanError = 1 /* ScanError.UnexpectedEndOfComment */;
                        }
                        value = text.substring(start, pos);
                        return token = 13 /* SyntaxKind.BlockCommentTrivia */;
                    }
                    // just a single slash
                    value += String.fromCharCode(code);
                    pos++;
                    return token = 16 /* SyntaxKind.Unknown */;
                }
                // numbers
                case 45 /* CharacterCodes.minus */:
                    value += String.fromCharCode(code);
                    pos++;
                    if (pos === len || !isDigit(text.charCodeAt(pos))) {
                        return token = 16 /* SyntaxKind.Unknown */;
                    }
                // found a minus, followed by a number so
                // we fall through to proceed with scanning
                // numbers
                case 48 /* CharacterCodes._0 */:
                case 49 /* CharacterCodes._1 */:
                case 50 /* CharacterCodes._2 */:
                case 51 /* CharacterCodes._3 */:
                case 52 /* CharacterCodes._4 */:
                case 53 /* CharacterCodes._5 */:
                case 54 /* CharacterCodes._6 */:
                case 55 /* CharacterCodes._7 */:
                case 56 /* CharacterCodes._8 */:
                case 57 /* CharacterCodes._9 */:
                    value += scanNumber();
                    return token = 11 /* SyntaxKind.NumericLiteral */;
                // literals and unknown symbols
                default:
                    // is a literal? Read the full word.
                    while (pos < len && isUnknownContentCharacter(code)) {
                        pos++;
                        code = text.charCodeAt(pos);
                    }
                    if (tokenOffset !== pos) {
                        value = text.substring(tokenOffset, pos);
                        // keywords: true, false, null
                        switch (value) {
                            case 'true': return token = 8 /* SyntaxKind.TrueKeyword */;
                            case 'false': return token = 9 /* SyntaxKind.FalseKeyword */;
                            case 'null': return token = 7 /* SyntaxKind.NullKeyword */;
                        }
                        return token = 16 /* SyntaxKind.Unknown */;
                    }
                    // some
                    value += String.fromCharCode(code);
                    pos++;
                    return token = 16 /* SyntaxKind.Unknown */;
            }
        }
        function isUnknownContentCharacter(code) {
            if (isWhitespace(code) || isLineBreak(code)) {
                return false;
            }
            switch (code) {
                case 125 /* CharacterCodes.closeBrace */:
                case 93 /* CharacterCodes.closeBracket */:
                case 123 /* CharacterCodes.openBrace */:
                case 91 /* CharacterCodes.openBracket */:
                case 34 /* CharacterCodes.doubleQuote */:
                case 58 /* CharacterCodes.colon */:
                case 44 /* CharacterCodes.comma */:
                case 47 /* CharacterCodes.slash */:
                    return false;
            }
            return true;
        }
        function scanNextNonTrivia() {
            let result;
            do {
                result = scanNext();
            } while (result >= 12 /* SyntaxKind.LineCommentTrivia */ && result <= 15 /* SyntaxKind.Trivia */);
            return result;
        }
        return {
            setPosition: setPosition,
            getPosition: () => pos,
            scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
            getToken: () => token,
            getTokenValue: () => value,
            getTokenOffset: () => tokenOffset,
            getTokenLength: () => pos - tokenOffset,
            getTokenError: () => scanError
        };
    }
    exports.createScanner = createScanner;
    function isWhitespace(ch) {
        return ch === 32 /* CharacterCodes.space */ || ch === 9 /* CharacterCodes.tab */ || ch === 11 /* CharacterCodes.verticalTab */ || ch === 12 /* CharacterCodes.formFeed */ ||
            ch === 160 /* CharacterCodes.nonBreakingSpace */ || ch === 5760 /* CharacterCodes.ogham */ || ch >= 8192 /* CharacterCodes.enQuad */ && ch <= 8203 /* CharacterCodes.zeroWidthSpace */ ||
            ch === 8239 /* CharacterCodes.narrowNoBreakSpace */ || ch === 8287 /* CharacterCodes.mathematicalSpace */ || ch === 12288 /* CharacterCodes.ideographicSpace */ || ch === 65279 /* CharacterCodes.byteOrderMark */;
    }
    function isLineBreak(ch) {
        return ch === 10 /* CharacterCodes.lineFeed */ || ch === 13 /* CharacterCodes.carriageReturn */ || ch === 8232 /* CharacterCodes.lineSeparator */ || ch === 8233 /* CharacterCodes.paragraphSeparator */;
    }
    function isDigit(ch) {
        return ch >= 48 /* CharacterCodes._0 */ && ch <= 57 /* CharacterCodes._9 */;
    }
    var CharacterCodes;
    (function (CharacterCodes) {
        CharacterCodes[CharacterCodes["nullCharacter"] = 0] = "nullCharacter";
        CharacterCodes[CharacterCodes["maxAsciiCharacter"] = 127] = "maxAsciiCharacter";
        CharacterCodes[CharacterCodes["lineFeed"] = 10] = "lineFeed";
        CharacterCodes[CharacterCodes["carriageReturn"] = 13] = "carriageReturn";
        CharacterCodes[CharacterCodes["lineSeparator"] = 8232] = "lineSeparator";
        CharacterCodes[CharacterCodes["paragraphSeparator"] = 8233] = "paragraphSeparator";
        // REVIEW: do we need to support this?  The scanner doesn't, but our IText does.  This seems
        // like an odd disparity?  (Or maybe it's completely fine for them to be different).
        CharacterCodes[CharacterCodes["nextLine"] = 133] = "nextLine";
        // Unicode 3.0 space characters
        CharacterCodes[CharacterCodes["space"] = 32] = "space";
        CharacterCodes[CharacterCodes["nonBreakingSpace"] = 160] = "nonBreakingSpace";
        CharacterCodes[CharacterCodes["enQuad"] = 8192] = "enQuad";
        CharacterCodes[CharacterCodes["emQuad"] = 8193] = "emQuad";
        CharacterCodes[CharacterCodes["enSpace"] = 8194] = "enSpace";
        CharacterCodes[CharacterCodes["emSpace"] = 8195] = "emSpace";
        CharacterCodes[CharacterCodes["threePerEmSpace"] = 8196] = "threePerEmSpace";
        CharacterCodes[CharacterCodes["fourPerEmSpace"] = 8197] = "fourPerEmSpace";
        CharacterCodes[CharacterCodes["sixPerEmSpace"] = 8198] = "sixPerEmSpace";
        CharacterCodes[CharacterCodes["figureSpace"] = 8199] = "figureSpace";
        CharacterCodes[CharacterCodes["punctuationSpace"] = 8200] = "punctuationSpace";
        CharacterCodes[CharacterCodes["thinSpace"] = 8201] = "thinSpace";
        CharacterCodes[CharacterCodes["hairSpace"] = 8202] = "hairSpace";
        CharacterCodes[CharacterCodes["zeroWidthSpace"] = 8203] = "zeroWidthSpace";
        CharacterCodes[CharacterCodes["narrowNoBreakSpace"] = 8239] = "narrowNoBreakSpace";
        CharacterCodes[CharacterCodes["ideographicSpace"] = 12288] = "ideographicSpace";
        CharacterCodes[CharacterCodes["mathematicalSpace"] = 8287] = "mathematicalSpace";
        CharacterCodes[CharacterCodes["ogham"] = 5760] = "ogham";
        CharacterCodes[CharacterCodes["_"] = 95] = "_";
        CharacterCodes[CharacterCodes["$"] = 36] = "$";
        CharacterCodes[CharacterCodes["_0"] = 48] = "_0";
        CharacterCodes[CharacterCodes["_1"] = 49] = "_1";
        CharacterCodes[CharacterCodes["_2"] = 50] = "_2";
        CharacterCodes[CharacterCodes["_3"] = 51] = "_3";
        CharacterCodes[CharacterCodes["_4"] = 52] = "_4";
        CharacterCodes[CharacterCodes["_5"] = 53] = "_5";
        CharacterCodes[CharacterCodes["_6"] = 54] = "_6";
        CharacterCodes[CharacterCodes["_7"] = 55] = "_7";
        CharacterCodes[CharacterCodes["_8"] = 56] = "_8";
        CharacterCodes[CharacterCodes["_9"] = 57] = "_9";
        CharacterCodes[CharacterCodes["a"] = 97] = "a";
        CharacterCodes[CharacterCodes["b"] = 98] = "b";
        CharacterCodes[CharacterCodes["c"] = 99] = "c";
        CharacterCodes[CharacterCodes["d"] = 100] = "d";
        CharacterCodes[CharacterCodes["e"] = 101] = "e";
        CharacterCodes[CharacterCodes["f"] = 102] = "f";
        CharacterCodes[CharacterCodes["g"] = 103] = "g";
        CharacterCodes[CharacterCodes["h"] = 104] = "h";
        CharacterCodes[CharacterCodes["i"] = 105] = "i";
        CharacterCodes[CharacterCodes["j"] = 106] = "j";
        CharacterCodes[CharacterCodes["k"] = 107] = "k";
        CharacterCodes[CharacterCodes["l"] = 108] = "l";
        CharacterCodes[CharacterCodes["m"] = 109] = "m";
        CharacterCodes[CharacterCodes["n"] = 110] = "n";
        CharacterCodes[CharacterCodes["o"] = 111] = "o";
        CharacterCodes[CharacterCodes["p"] = 112] = "p";
        CharacterCodes[CharacterCodes["q"] = 113] = "q";
        CharacterCodes[CharacterCodes["r"] = 114] = "r";
        CharacterCodes[CharacterCodes["s"] = 115] = "s";
        CharacterCodes[CharacterCodes["t"] = 116] = "t";
        CharacterCodes[CharacterCodes["u"] = 117] = "u";
        CharacterCodes[CharacterCodes["v"] = 118] = "v";
        CharacterCodes[CharacterCodes["w"] = 119] = "w";
        CharacterCodes[CharacterCodes["x"] = 120] = "x";
        CharacterCodes[CharacterCodes["y"] = 121] = "y";
        CharacterCodes[CharacterCodes["z"] = 122] = "z";
        CharacterCodes[CharacterCodes["A"] = 65] = "A";
        CharacterCodes[CharacterCodes["B"] = 66] = "B";
        CharacterCodes[CharacterCodes["C"] = 67] = "C";
        CharacterCodes[CharacterCodes["D"] = 68] = "D";
        CharacterCodes[CharacterCodes["E"] = 69] = "E";
        CharacterCodes[CharacterCodes["F"] = 70] = "F";
        CharacterCodes[CharacterCodes["G"] = 71] = "G";
        CharacterCodes[CharacterCodes["H"] = 72] = "H";
        CharacterCodes[CharacterCodes["I"] = 73] = "I";
        CharacterCodes[CharacterCodes["J"] = 74] = "J";
        CharacterCodes[CharacterCodes["K"] = 75] = "K";
        CharacterCodes[CharacterCodes["L"] = 76] = "L";
        CharacterCodes[CharacterCodes["M"] = 77] = "M";
        CharacterCodes[CharacterCodes["N"] = 78] = "N";
        CharacterCodes[CharacterCodes["O"] = 79] = "O";
        CharacterCodes[CharacterCodes["P"] = 80] = "P";
        CharacterCodes[CharacterCodes["Q"] = 81] = "Q";
        CharacterCodes[CharacterCodes["R"] = 82] = "R";
        CharacterCodes[CharacterCodes["S"] = 83] = "S";
        CharacterCodes[CharacterCodes["T"] = 84] = "T";
        CharacterCodes[CharacterCodes["U"] = 85] = "U";
        CharacterCodes[CharacterCodes["V"] = 86] = "V";
        CharacterCodes[CharacterCodes["W"] = 87] = "W";
        CharacterCodes[CharacterCodes["X"] = 88] = "X";
        CharacterCodes[CharacterCodes["Y"] = 89] = "Y";
        CharacterCodes[CharacterCodes["Z"] = 90] = "Z";
        CharacterCodes[CharacterCodes["ampersand"] = 38] = "ampersand";
        CharacterCodes[CharacterCodes["asterisk"] = 42] = "asterisk";
        CharacterCodes[CharacterCodes["at"] = 64] = "at";
        CharacterCodes[CharacterCodes["backslash"] = 92] = "backslash";
        CharacterCodes[CharacterCodes["bar"] = 124] = "bar";
        CharacterCodes[CharacterCodes["caret"] = 94] = "caret";
        CharacterCodes[CharacterCodes["closeBrace"] = 125] = "closeBrace";
        CharacterCodes[CharacterCodes["closeBracket"] = 93] = "closeBracket";
        CharacterCodes[CharacterCodes["closeParen"] = 41] = "closeParen";
        CharacterCodes[CharacterCodes["colon"] = 58] = "colon";
        CharacterCodes[CharacterCodes["comma"] = 44] = "comma";
        CharacterCodes[CharacterCodes["dot"] = 46] = "dot";
        CharacterCodes[CharacterCodes["doubleQuote"] = 34] = "doubleQuote";
        CharacterCodes[CharacterCodes["equals"] = 61] = "equals";
        CharacterCodes[CharacterCodes["exclamation"] = 33] = "exclamation";
        CharacterCodes[CharacterCodes["greaterThan"] = 62] = "greaterThan";
        CharacterCodes[CharacterCodes["lessThan"] = 60] = "lessThan";
        CharacterCodes[CharacterCodes["minus"] = 45] = "minus";
        CharacterCodes[CharacterCodes["openBrace"] = 123] = "openBrace";
        CharacterCodes[CharacterCodes["openBracket"] = 91] = "openBracket";
        CharacterCodes[CharacterCodes["openParen"] = 40] = "openParen";
        CharacterCodes[CharacterCodes["percent"] = 37] = "percent";
        CharacterCodes[CharacterCodes["plus"] = 43] = "plus";
        CharacterCodes[CharacterCodes["question"] = 63] = "question";
        CharacterCodes[CharacterCodes["semicolon"] = 59] = "semicolon";
        CharacterCodes[CharacterCodes["singleQuote"] = 39] = "singleQuote";
        CharacterCodes[CharacterCodes["slash"] = 47] = "slash";
        CharacterCodes[CharacterCodes["tilde"] = 126] = "tilde";
        CharacterCodes[CharacterCodes["backspace"] = 8] = "backspace";
        CharacterCodes[CharacterCodes["formFeed"] = 12] = "formFeed";
        CharacterCodes[CharacterCodes["byteOrderMark"] = 65279] = "byteOrderMark";
        CharacterCodes[CharacterCodes["tab"] = 9] = "tab";
        CharacterCodes[CharacterCodes["verticalTab"] = 11] = "verticalTab";
    })(CharacterCodes || (CharacterCodes = {}));
    /**
     * For a given offset, evaluate the location in the JSON document. Each segment in the location path is either a property name or an array index.
     */
    function getLocation(text, position) {
        const segments = []; // strings or numbers
        const earlyReturnException = new Object();
        let previousNode = undefined;
        const previousNodeInst = {
            value: {},
            offset: 0,
            length: 0,
            type: 'object',
            parent: undefined
        };
        let isAtPropertyKey = false;
        function setPreviousNode(value, offset, length, type) {
            previousNodeInst.value = value;
            previousNodeInst.offset = offset;
            previousNodeInst.length = length;
            previousNodeInst.type = type;
            previousNodeInst.colonOffset = undefined;
            previousNode = previousNodeInst;
        }
        try {
            visit(text, {
                onObjectBegin: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    isAtPropertyKey = position > offset;
                    segments.push(''); // push a placeholder (will be replaced)
                },
                onObjectProperty: (name, offset, length) => {
                    if (position < offset) {
                        throw earlyReturnException;
                    }
                    setPreviousNode(name, offset, length, 'property');
                    segments[segments.length - 1] = name;
                    if (position <= offset + length) {
                        throw earlyReturnException;
                    }
                },
                onObjectEnd: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    segments.pop();
                },
                onArrayBegin: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    segments.push(0);
                },
                onArrayEnd: (offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    previousNode = undefined;
                    segments.pop();
                },
                onLiteralValue: (value, offset, length) => {
                    if (position < offset) {
                        throw earlyReturnException;
                    }
                    setPreviousNode(value, offset, length, getNodeType(value));
                    if (position <= offset + length) {
                        throw earlyReturnException;
                    }
                },
                onSeparator: (sep, offset, length) => {
                    if (position <= offset) {
                        throw earlyReturnException;
                    }
                    if (sep === ':' && previousNode && previousNode.type === 'property') {
                        previousNode.colonOffset = offset;
                        isAtPropertyKey = false;
                        previousNode = undefined;
                    }
                    else if (sep === ',') {
                        const last = segments[segments.length - 1];
                        if (typeof last === 'number') {
                            segments[segments.length - 1] = last + 1;
                        }
                        else {
                            isAtPropertyKey = true;
                            segments[segments.length - 1] = '';
                        }
                        previousNode = undefined;
                    }
                }
            });
        }
        catch (e) {
            if (e !== earlyReturnException) {
                throw e;
            }
        }
        return {
            path: segments,
            previousNode,
            isAtPropertyKey,
            matches: (pattern) => {
                let k = 0;
                for (let i = 0; k < pattern.length && i < segments.length; i++) {
                    if (pattern[k] === segments[i] || pattern[k] === '*') {
                        k++;
                    }
                    else if (pattern[k] !== '**') {
                        return false;
                    }
                }
                return k === pattern.length;
            }
        };
    }
    exports.getLocation = getLocation;
    /**
     * Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
     * Therefore always check the errors list to find out if the input was valid.
     */
    function parse(text, errors = [], options = ParseOptions.DEFAULT) {
        let currentProperty = null;
        let currentParent = [];
        const previousParents = [];
        function onValue(value) {
            if (Array.isArray(currentParent)) {
                currentParent.push(value);
            }
            else if (currentProperty !== null) {
                currentParent[currentProperty] = value;
            }
        }
        const visitor = {
            onObjectBegin: () => {
                const object = {};
                onValue(object);
                previousParents.push(currentParent);
                currentParent = object;
                currentProperty = null;
            },
            onObjectProperty: (name) => {
                currentProperty = name;
            },
            onObjectEnd: () => {
                currentParent = previousParents.pop();
            },
            onArrayBegin: () => {
                const array = [];
                onValue(array);
                previousParents.push(currentParent);
                currentParent = array;
                currentProperty = null;
            },
            onArrayEnd: () => {
                currentParent = previousParents.pop();
            },
            onLiteralValue: onValue,
            onError: (error, offset, length) => {
                errors.push({ error, offset, length });
            }
        };
        visit(text, visitor, options);
        return currentParent[0];
    }
    exports.parse = parse;
    /**
     * Parses the given text and returns a tree representation the JSON content. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
     */
    function parseTree(text, errors = [], options = ParseOptions.DEFAULT) {
        let currentParent = { type: 'array', offset: -1, length: -1, children: [], parent: undefined }; // artificial root
        function ensurePropertyComplete(endOffset) {
            if (currentParent.type === 'property') {
                currentParent.length = endOffset - currentParent.offset;
                currentParent = currentParent.parent;
            }
        }
        function onValue(valueNode) {
            currentParent.children.push(valueNode);
            return valueNode;
        }
        const visitor = {
            onObjectBegin: (offset) => {
                currentParent = onValue({ type: 'object', offset, length: -1, parent: currentParent, children: [] });
            },
            onObjectProperty: (name, offset, length) => {
                currentParent = onValue({ type: 'property', offset, length: -1, parent: currentParent, children: [] });
                currentParent.children.push({ type: 'string', value: name, offset, length, parent: currentParent });
            },
            onObjectEnd: (offset, length) => {
                currentParent.length = offset + length - currentParent.offset;
                currentParent = currentParent.parent;
                ensurePropertyComplete(offset + length);
            },
            onArrayBegin: (offset, length) => {
                currentParent = onValue({ type: 'array', offset, length: -1, parent: currentParent, children: [] });
            },
            onArrayEnd: (offset, length) => {
                currentParent.length = offset + length - currentParent.offset;
                currentParent = currentParent.parent;
                ensurePropertyComplete(offset + length);
            },
            onLiteralValue: (value, offset, length) => {
                onValue({ type: getNodeType(value), offset, length, parent: currentParent, value });
                ensurePropertyComplete(offset + length);
            },
            onSeparator: (sep, offset, length) => {
                if (currentParent.type === 'property') {
                    if (sep === ':') {
                        currentParent.colonOffset = offset;
                    }
                    else if (sep === ',') {
                        ensurePropertyComplete(offset);
                    }
                }
            },
            onError: (error, offset, length) => {
                errors.push({ error, offset, length });
            }
        };
        visit(text, visitor, options);
        const result = currentParent.children[0];
        if (result) {
            delete result.parent;
        }
        return result;
    }
    exports.parseTree = parseTree;
    /**
     * Finds the node at the given path in a JSON DOM.
     */
    function findNodeAtLocation(root, path) {
        if (!root) {
            return undefined;
        }
        let node = root;
        for (const segment of path) {
            if (typeof segment === 'string') {
                if (node.type !== 'object' || !Array.isArray(node.children)) {
                    return undefined;
                }
                let found = false;
                for (const propertyNode of node.children) {
                    if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment) {
                        node = propertyNode.children[1];
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return undefined;
                }
            }
            else {
                const index = segment;
                if (node.type !== 'array' || index < 0 || !Array.isArray(node.children) || index >= node.children.length) {
                    return undefined;
                }
                node = node.children[index];
            }
        }
        return node;
    }
    exports.findNodeAtLocation = findNodeAtLocation;
    /**
     * Gets the JSON path of the given JSON DOM node
     */
    function getNodePath(node) {
        if (!node.parent || !node.parent.children) {
            return [];
        }
        const path = getNodePath(node.parent);
        if (node.parent.type === 'property') {
            const key = node.parent.children[0].value;
            path.push(key);
        }
        else if (node.parent.type === 'array') {
            const index = node.parent.children.indexOf(node);
            if (index !== -1) {
                path.push(index);
            }
        }
        return path;
    }
    exports.getNodePath = getNodePath;
    /**
     * Evaluates the JavaScript object of the given JSON DOM node
     */
    function getNodeValue(node) {
        switch (node.type) {
            case 'array':
                return node.children.map(getNodeValue);
            case 'object': {
                const obj = Object.create(null);
                for (const prop of node.children) {
                    const valueNode = prop.children[1];
                    if (valueNode) {
                        obj[prop.children[0].value] = getNodeValue(valueNode);
                    }
                }
                return obj;
            }
            case 'null':
            case 'string':
            case 'number':
            case 'boolean':
                return node.value;
            default:
                return undefined;
        }
    }
    exports.getNodeValue = getNodeValue;
    function contains(node, offset, includeRightBound = false) {
        return (offset >= node.offset && offset < (node.offset + node.length)) || includeRightBound && (offset === (node.offset + node.length));
    }
    exports.contains = contains;
    /**
     * Finds the most inner node at the given offset. If includeRightBound is set, also finds nodes that end at the given offset.
     */
    function findNodeAtOffset(node, offset, includeRightBound = false) {
        if (contains(node, offset, includeRightBound)) {
            const children = node.children;
            if (Array.isArray(children)) {
                for (let i = 0; i < children.length && children[i].offset <= offset; i++) {
                    const item = findNodeAtOffset(children[i], offset, includeRightBound);
                    if (item) {
                        return item;
                    }
                }
            }
            return node;
        }
        return undefined;
    }
    exports.findNodeAtOffset = findNodeAtOffset;
    /**
     * Parses the given text and invokes the visitor functions for each object, array and literal reached.
     */
    function visit(text, visitor, options = ParseOptions.DEFAULT) {
        const _scanner = createScanner(text, false);
        function toNoArgVisit(visitFunction) {
            return visitFunction ? () => visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
        }
        function toOneArgVisit(visitFunction) {
            return visitFunction ? (arg) => visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
        }
        const onObjectBegin = toNoArgVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisit(visitor.onObjectProperty), onObjectEnd = toNoArgVisit(visitor.onObjectEnd), onArrayBegin = toNoArgVisit(visitor.onArrayBegin), onArrayEnd = toNoArgVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisit(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
        const disallowComments = options && options.disallowComments;
        const allowTrailingComma = options && options.allowTrailingComma;
        function scanNext() {
            while (true) {
                const token = _scanner.scan();
                switch (_scanner.getTokenError()) {
                    case 4 /* ScanError.InvalidUnicode */:
                        handleError(14 /* ParseErrorCode.InvalidUnicode */);
                        break;
                    case 5 /* ScanError.InvalidEscapeCharacter */:
                        handleError(15 /* ParseErrorCode.InvalidEscapeCharacter */);
                        break;
                    case 3 /* ScanError.UnexpectedEndOfNumber */:
                        handleError(13 /* ParseErrorCode.UnexpectedEndOfNumber */);
                        break;
                    case 1 /* ScanError.UnexpectedEndOfComment */:
                        if (!disallowComments) {
                            handleError(11 /* ParseErrorCode.UnexpectedEndOfComment */);
                        }
                        break;
                    case 2 /* ScanError.UnexpectedEndOfString */:
                        handleError(12 /* ParseErrorCode.UnexpectedEndOfString */);
                        break;
                    case 6 /* ScanError.InvalidCharacter */:
                        handleError(16 /* ParseErrorCode.InvalidCharacter */);
                        break;
                }
                switch (token) {
                    case 12 /* SyntaxKind.LineCommentTrivia */:
                    case 13 /* SyntaxKind.BlockCommentTrivia */:
                        if (disallowComments) {
                            handleError(10 /* ParseErrorCode.InvalidCommentToken */);
                        }
                        else {
                            onComment();
                        }
                        break;
                    case 16 /* SyntaxKind.Unknown */:
                        handleError(1 /* ParseErrorCode.InvalidSymbol */);
                        break;
                    case 15 /* SyntaxKind.Trivia */:
                    case 14 /* SyntaxKind.LineBreakTrivia */:
                        break;
                    default:
                        return token;
                }
            }
        }
        function handleError(error, skipUntilAfter = [], skipUntil = []) {
            onError(error);
            if (skipUntilAfter.length + skipUntil.length > 0) {
                let token = _scanner.getToken();
                while (token !== 17 /* SyntaxKind.EOF */) {
                    if (skipUntilAfter.indexOf(token) !== -1) {
                        scanNext();
                        break;
                    }
                    else if (skipUntil.indexOf(token) !== -1) {
                        break;
                    }
                    token = scanNext();
                }
            }
        }
        function parseString(isValue) {
            const value = _scanner.getTokenValue();
            if (isValue) {
                onLiteralValue(value);
            }
            else {
                onObjectProperty(value);
            }
            scanNext();
            return true;
        }
        function parseLiteral() {
            switch (_scanner.getToken()) {
                case 11 /* SyntaxKind.NumericLiteral */: {
                    let value = 0;
                    try {
                        value = JSON.parse(_scanner.getTokenValue());
                        if (typeof value !== 'number') {
                            handleError(2 /* ParseErrorCode.InvalidNumberFormat */);
                            value = 0;
                        }
                    }
                    catch (e) {
                        handleError(2 /* ParseErrorCode.InvalidNumberFormat */);
                    }
                    onLiteralValue(value);
                    break;
                }
                case 7 /* SyntaxKind.NullKeyword */:
                    onLiteralValue(null);
                    break;
                case 8 /* SyntaxKind.TrueKeyword */:
                    onLiteralValue(true);
                    break;
                case 9 /* SyntaxKind.FalseKeyword */:
                    onLiteralValue(false);
                    break;
                default:
                    return false;
            }
            scanNext();
            return true;
        }
        function parseProperty() {
            if (_scanner.getToken() !== 10 /* SyntaxKind.StringLiteral */) {
                handleError(3 /* ParseErrorCode.PropertyNameExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
                return false;
            }
            parseString(false);
            if (_scanner.getToken() === 6 /* SyntaxKind.ColonToken */) {
                onSeparator(':');
                scanNext(); // consume colon
                if (!parseValue()) {
                    handleError(4 /* ParseErrorCode.ValueExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
                }
            }
            else {
                handleError(5 /* ParseErrorCode.ColonExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
            }
            return true;
        }
        function parseObject() {
            onObjectBegin();
            scanNext(); // consume open brace
            let needsComma = false;
            while (_scanner.getToken() !== 2 /* SyntaxKind.CloseBraceToken */ && _scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
                if (_scanner.getToken() === 5 /* SyntaxKind.CommaToken */) {
                    if (!needsComma) {
                        handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
                    }
                    onSeparator(',');
                    scanNext(); // consume comma
                    if (_scanner.getToken() === 2 /* SyntaxKind.CloseBraceToken */ && allowTrailingComma) {
                        break;
                    }
                }
                else if (needsComma) {
                    handleError(6 /* ParseErrorCode.CommaExpected */, [], []);
                }
                if (!parseProperty()) {
                    handleError(4 /* ParseErrorCode.ValueExpected */, [], [2 /* SyntaxKind.CloseBraceToken */, 5 /* SyntaxKind.CommaToken */]);
                }
                needsComma = true;
            }
            onObjectEnd();
            if (_scanner.getToken() !== 2 /* SyntaxKind.CloseBraceToken */) {
                handleError(7 /* ParseErrorCode.CloseBraceExpected */, [2 /* SyntaxKind.CloseBraceToken */], []);
            }
            else {
                scanNext(); // consume close brace
            }
            return true;
        }
        function parseArray() {
            onArrayBegin();
            scanNext(); // consume open bracket
            let needsComma = false;
            while (_scanner.getToken() !== 4 /* SyntaxKind.CloseBracketToken */ && _scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
                if (_scanner.getToken() === 5 /* SyntaxKind.CommaToken */) {
                    if (!needsComma) {
                        handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
                    }
                    onSeparator(',');
                    scanNext(); // consume comma
                    if (_scanner.getToken() === 4 /* SyntaxKind.CloseBracketToken */ && allowTrailingComma) {
                        break;
                    }
                }
                else if (needsComma) {
                    handleError(6 /* ParseErrorCode.CommaExpected */, [], []);
                }
                if (!parseValue()) {
                    handleError(4 /* ParseErrorCode.ValueExpected */, [], [4 /* SyntaxKind.CloseBracketToken */, 5 /* SyntaxKind.CommaToken */]);
                }
                needsComma = true;
            }
            onArrayEnd();
            if (_scanner.getToken() !== 4 /* SyntaxKind.CloseBracketToken */) {
                handleError(8 /* ParseErrorCode.CloseBracketExpected */, [4 /* SyntaxKind.CloseBracketToken */], []);
            }
            else {
                scanNext(); // consume close bracket
            }
            return true;
        }
        function parseValue() {
            switch (_scanner.getToken()) {
                case 3 /* SyntaxKind.OpenBracketToken */:
                    return parseArray();
                case 1 /* SyntaxKind.OpenBraceToken */:
                    return parseObject();
                case 10 /* SyntaxKind.StringLiteral */:
                    return parseString(true);
                default:
                    return parseLiteral();
            }
        }
        scanNext();
        if (_scanner.getToken() === 17 /* SyntaxKind.EOF */) {
            if (options.allowEmptyContent) {
                return true;
            }
            handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
            return false;
        }
        if (!parseValue()) {
            handleError(4 /* ParseErrorCode.ValueExpected */, [], []);
            return false;
        }
        if (_scanner.getToken() !== 17 /* SyntaxKind.EOF */) {
            handleError(9 /* ParseErrorCode.EndOfFileExpected */, [], []);
        }
        return true;
    }
    exports.visit = visit;
    /**
     * Takes JSON with JavaScript-style comments and remove
     * them. Optionally replaces every none-newline character
     * of comments with a replaceCharacter
     */
    function stripComments(text, replaceCh) {
        const _scanner = createScanner(text);
        const parts = [];
        let kind;
        let offset = 0;
        let pos;
        do {
            pos = _scanner.getPosition();
            kind = _scanner.scan();
            switch (kind) {
                case 12 /* SyntaxKind.LineCommentTrivia */:
                case 13 /* SyntaxKind.BlockCommentTrivia */:
                case 17 /* SyntaxKind.EOF */:
                    if (offset !== pos) {
                        parts.push(text.substring(offset, pos));
                    }
                    if (replaceCh !== undefined) {
                        parts.push(_scanner.getTokenValue().replace(/[^\r\n]/g, replaceCh));
                    }
                    offset = _scanner.getPosition();
                    break;
            }
        } while (kind !== 17 /* SyntaxKind.EOF */);
        return parts.join('');
    }
    exports.stripComments = stripComments;
    function getNodeType(value) {
        switch (typeof value) {
            case 'boolean': return 'boolean';
            case 'number': return 'number';
            case 'string': return 'string';
            case 'object': {
                if (!value) {
                    return 'null';
                }
                else if (Array.isArray(value)) {
                    return 'array';
                }
                return 'object';
            }
            default: return 'null';
        }
    }
    exports.getNodeType = getNodeType;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vanNvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEcsSUFBa0IsU0FRakI7SUFSRCxXQUFrQixTQUFTO1FBQzFCLHlDQUFRLENBQUE7UUFDUiw2RUFBMEIsQ0FBQTtRQUMxQiwyRUFBeUIsQ0FBQTtRQUN6QiwyRUFBeUIsQ0FBQTtRQUN6Qiw2REFBa0IsQ0FBQTtRQUNsQiw2RUFBMEIsQ0FBQTtRQUMxQixpRUFBb0IsQ0FBQTtJQUNyQixDQUFDLEVBUmlCLFNBQVMseUJBQVQsU0FBUyxRQVExQjtJQUVELElBQWtCLFVBa0JqQjtJQWxCRCxXQUFrQixVQUFVO1FBQzNCLCtEQUFrQixDQUFBO1FBQ2xCLGlFQUFtQixDQUFBO1FBQ25CLG1FQUFvQixDQUFBO1FBQ3BCLHFFQUFxQixDQUFBO1FBQ3JCLHVEQUFjLENBQUE7UUFDZCx1REFBYyxDQUFBO1FBQ2QseURBQWUsQ0FBQTtRQUNmLHlEQUFlLENBQUE7UUFDZiwyREFBZ0IsQ0FBQTtRQUNoQiw4REFBa0IsQ0FBQTtRQUNsQixnRUFBbUIsQ0FBQTtRQUNuQixzRUFBc0IsQ0FBQTtRQUN0Qix3RUFBdUIsQ0FBQTtRQUN2QixrRUFBb0IsQ0FBQTtRQUNwQixnREFBVyxDQUFBO1FBQ1gsa0RBQVksQ0FBQTtRQUNaLDBDQUFRLENBQUE7SUFDVCxDQUFDLEVBbEJpQixVQUFVLDBCQUFWLFVBQVUsUUFrQjNCO0lBZ0RELElBQWtCLGNBaUJqQjtJQWpCRCxXQUFrQixjQUFjO1FBQy9CLHFFQUFpQixDQUFBO1FBQ2pCLGlGQUF1QixDQUFBO1FBQ3ZCLG1GQUF3QixDQUFBO1FBQ3hCLHFFQUFpQixDQUFBO1FBQ2pCLHFFQUFpQixDQUFBO1FBQ2pCLHFFQUFpQixDQUFBO1FBQ2pCLCtFQUFzQixDQUFBO1FBQ3RCLG1G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
//# sourceURL=../../../vs/base/common/json.js
})
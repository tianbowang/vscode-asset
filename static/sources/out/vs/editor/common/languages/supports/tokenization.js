/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color"], function (require, exports, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generateTokensCSSForColorMap = exports.ThemeTrieElement = exports.ExternalThemeTrieElement = exports.ThemeTrieElementRule = exports.strcmp = exports.toStandardTokenType = exports.TokenTheme = exports.ColorMap = exports.parseTokenTheme = exports.ParsedTokenThemeRule = void 0;
    class ParsedTokenThemeRule {
        constructor(token, index, fontStyle, foreground, background) {
            this._parsedThemeRuleBrand = undefined;
            this.token = token;
            this.index = index;
            this.fontStyle = fontStyle;
            this.foreground = foreground;
            this.background = background;
        }
    }
    exports.ParsedTokenThemeRule = ParsedTokenThemeRule;
    /**
     * Parse a raw theme into rules.
     */
    function parseTokenTheme(source) {
        if (!source || !Array.isArray(source)) {
            return [];
        }
        const result = [];
        let resultLen = 0;
        for (let i = 0, len = source.length; i < len; i++) {
            const entry = source[i];
            let fontStyle = -1 /* FontStyle.NotSet */;
            if (typeof entry.fontStyle === 'string') {
                fontStyle = 0 /* FontStyle.None */;
                const segments = entry.fontStyle.split(' ');
                for (let j = 0, lenJ = segments.length; j < lenJ; j++) {
                    const segment = segments[j];
                    switch (segment) {
                        case 'italic':
                            fontStyle = fontStyle | 1 /* FontStyle.Italic */;
                            break;
                        case 'bold':
                            fontStyle = fontStyle | 2 /* FontStyle.Bold */;
                            break;
                        case 'underline':
                            fontStyle = fontStyle | 4 /* FontStyle.Underline */;
                            break;
                        case 'strikethrough':
                            fontStyle = fontStyle | 8 /* FontStyle.Strikethrough */;
                            break;
                    }
                }
            }
            let foreground = null;
            if (typeof entry.foreground === 'string') {
                foreground = entry.foreground;
            }
            let background = null;
            if (typeof entry.background === 'string') {
                background = entry.background;
            }
            result[resultLen++] = new ParsedTokenThemeRule(entry.token || '', i, fontStyle, foreground, background);
        }
        return result;
    }
    exports.parseTokenTheme = parseTokenTheme;
    /**
     * Resolve rules (i.e. inheritance).
     */
    function resolveParsedTokenThemeRules(parsedThemeRules, customTokenColors) {
        // Sort rules lexicographically, and then by index if necessary
        parsedThemeRules.sort((a, b) => {
            const r = strcmp(a.token, b.token);
            if (r !== 0) {
                return r;
            }
            return a.index - b.index;
        });
        // Determine defaults
        let defaultFontStyle = 0 /* FontStyle.None */;
        let defaultForeground = '000000';
        let defaultBackground = 'ffffff';
        while (parsedThemeRules.length >= 1 && parsedThemeRules[0].token === '') {
            const incomingDefaults = parsedThemeRules.shift();
            if (incomingDefaults.fontStyle !== -1 /* FontStyle.NotSet */) {
                defaultFontStyle = incomingDefaults.fontStyle;
            }
            if (incomingDefaults.foreground !== null) {
                defaultForeground = incomingDefaults.foreground;
            }
            if (incomingDefaults.background !== null) {
                defaultBackground = incomingDefaults.background;
            }
        }
        const colorMap = new ColorMap();
        // start with token colors from custom token themes
        for (const color of customTokenColors) {
            colorMap.getId(color);
        }
        const foregroundColorId = colorMap.getId(defaultForeground);
        const backgroundColorId = colorMap.getId(defaultBackground);
        const defaults = new ThemeTrieElementRule(defaultFontStyle, foregroundColorId, backgroundColorId);
        const root = new ThemeTrieElement(defaults);
        for (let i = 0, len = parsedThemeRules.length; i < len; i++) {
            const rule = parsedThemeRules[i];
            root.insert(rule.token, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
        }
        return new TokenTheme(colorMap, root);
    }
    const colorRegExp = /^#?([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/;
    class ColorMap {
        constructor() {
            this._lastColorId = 0;
            this._id2color = [];
            this._color2id = new Map();
        }
        getId(color) {
            if (color === null) {
                return 0;
            }
            const match = color.match(colorRegExp);
            if (!match) {
                throw new Error('Illegal value for token color: ' + color);
            }
            color = match[1].toUpperCase();
            let value = this._color2id.get(color);
            if (value) {
                return value;
            }
            value = ++this._lastColorId;
            this._color2id.set(color, value);
            this._id2color[value] = color_1.Color.fromHex('#' + color);
            return value;
        }
        getColorMap() {
            return this._id2color.slice(0);
        }
    }
    exports.ColorMap = ColorMap;
    class TokenTheme {
        static createFromRawTokenTheme(source, customTokenColors) {
            return this.createFromParsedTokenTheme(parseTokenTheme(source), customTokenColors);
        }
        static createFromParsedTokenTheme(source, customTokenColors) {
            return resolveParsedTokenThemeRules(source, customTokenColors);
        }
        constructor(colorMap, root) {
            this._colorMap = colorMap;
            this._root = root;
            this._cache = new Map();
        }
        getColorMap() {
            return this._colorMap.getColorMap();
        }
        /**
         * used for testing purposes
         */
        getThemeTrieElement() {
            return this._root.toExternalThemeTrieElement();
        }
        _match(token) {
            return this._root.match(token);
        }
        match(languageId, token) {
            // The cache contains the metadata without the language bits set.
            let result = this._cache.get(token);
            if (typeof result === 'undefined') {
                const rule = this._match(token);
                const standardToken = toStandardTokenType(token);
                result = (rule.metadata
                    | (standardToken << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)) >>> 0;
                this._cache.set(token, result);
            }
            return (result
                | (languageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)) >>> 0;
        }
    }
    exports.TokenTheme = TokenTheme;
    const STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|regexp)\b/;
    function toStandardTokenType(tokenType) {
        const m = tokenType.match(STANDARD_TOKEN_TYPE_REGEXP);
        if (!m) {
            return 0 /* StandardTokenType.Other */;
        }
        switch (m[1]) {
            case 'comment':
                return 1 /* StandardTokenType.Comment */;
            case 'string':
                return 2 /* StandardTokenType.String */;
            case 'regex':
                return 3 /* StandardTokenType.RegEx */;
            case 'regexp':
                return 3 /* StandardTokenType.RegEx */;
        }
        throw new Error('Unexpected match for standard token type!');
    }
    exports.toStandardTokenType = toStandardTokenType;
    function strcmp(a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    }
    exports.strcmp = strcmp;
    class ThemeTrieElementRule {
        constructor(fontStyle, foreground, background) {
            this._themeTrieElementRuleBrand = undefined;
            this._fontStyle = fontStyle;
            this._foreground = foreground;
            this._background = background;
            this.metadata = ((this._fontStyle << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
                | (this._foreground << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                | (this._background << 24 /* MetadataConsts.BACKGROUND_OFFSET */)) >>> 0;
        }
        clone() {
            return new ThemeTrieElementRule(this._fontStyle, this._foreground, this._background);
        }
        acceptOverwrite(fontStyle, foreground, background) {
            if (fontStyle !== -1 /* FontStyle.NotSet */) {
                this._fontStyle = fontStyle;
            }
            if (foreground !== 0 /* ColorId.None */) {
                this._foreground = foreground;
            }
            if (background !== 0 /* ColorId.None */) {
                this._background = background;
            }
            this.metadata = ((this._fontStyle << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
                | (this._foreground << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                | (this._background << 24 /* MetadataConsts.BACKGROUND_OFFSET */)) >>> 0;
        }
    }
    exports.ThemeTrieElementRule = ThemeTrieElementRule;
    class ExternalThemeTrieElement {
        constructor(mainRule, children = new Map()) {
            this.mainRule = mainRule;
            if (children instanceof Map) {
                this.children = children;
            }
            else {
                this.children = new Map();
                for (const key in children) {
                    this.children.set(key, children[key]);
                }
            }
        }
    }
    exports.ExternalThemeTrieElement = ExternalThemeTrieElement;
    class ThemeTrieElement {
        constructor(mainRule) {
            this._themeTrieElementBrand = undefined;
            this._mainRule = mainRule;
            this._children = new Map();
        }
        /**
         * used for testing purposes
         */
        toExternalThemeTrieElement() {
            const children = new Map();
            this._children.forEach((element, index) => {
                children.set(index, element.toExternalThemeTrieElement());
            });
            return new ExternalThemeTrieElement(this._mainRule, children);
        }
        match(token) {
            if (token === '') {
                return this._mainRule;
            }
            const dotIndex = token.indexOf('.');
            let head;
            let tail;
            if (dotIndex === -1) {
                head = token;
                tail = '';
            }
            else {
                head = token.substring(0, dotIndex);
                tail = token.substring(dotIndex + 1);
            }
            const child = this._children.get(head);
            if (typeof child !== 'undefined') {
                return child.match(tail);
            }
            return this._mainRule;
        }
        insert(token, fontStyle, foreground, background) {
            if (token === '') {
                // Merge into the main rule
                this._mainRule.acceptOverwrite(fontStyle, foreground, background);
                return;
            }
            const dotIndex = token.indexOf('.');
            let head;
            let tail;
            if (dotIndex === -1) {
                head = token;
                tail = '';
            }
            else {
                head = token.substring(0, dotIndex);
                tail = token.substring(dotIndex + 1);
            }
            let child = this._children.get(head);
            if (typeof child === 'undefined') {
                child = new ThemeTrieElement(this._mainRule.clone());
                this._children.set(head, child);
            }
            child.insert(tail, fontStyle, foreground, background);
        }
    }
    exports.ThemeTrieElement = ThemeTrieElement;
    function generateTokensCSSForColorMap(colorMap) {
        const rules = [];
        for (let i = 1, len = colorMap.length; i < len; i++) {
            const color = colorMap[i];
            rules[i] = `.mtk${i} { color: ${color}; }`;
        }
        rules.push('.mtki { font-style: italic; }');
        rules.push('.mtkb { font-weight: bold; }');
        rules.push('.mtku { text-decoration: underline; text-underline-position: under; }');
        rules.push('.mtks { text-decoration: line-through; }');
        rules.push('.mtks.mtku { text-decoration: underline line-through; text-underline-position: under; }');
        return rules.join('\n');
    }
    exports.generateTokensCSSForColorMap = generateTokensCSSForColorMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5pemF0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2xhbmd1YWdlcy9zdXBwb3J0cy90b2tlbml6YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQWEsb0JBQW9CO1FBYWhDLFlBQ0MsS0FBYSxFQUNiLEtBQWEsRUFDYixTQUFpQixFQUNqQixVQUF5QixFQUN6QixVQUF5QjtZQWpCMUIsMEJBQXFCLEdBQVMsU0FBUyxDQUFDO1lBbUJ2QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM5QixDQUFDO0tBQ0Q7SUExQkQsb0RBMEJDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixlQUFlLENBQUMsTUFBeUI7UUFDeEQsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUN2QyxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBMkIsRUFBRSxDQUFDO1FBQzFDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbkQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhCLElBQUksU0FBUyw0QkFBMkIsQ0FB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
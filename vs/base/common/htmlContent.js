(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/iconLabels", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uri"], function (require, exports, errors_1, iconLabels_1, resources_1, strings_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseHrefAndDimensions = exports.removeMarkdownEscapes = exports.escapeDoubleQuotes = exports.appendEscapedMarkdownCodeBlockFence = exports.escapeMarkdownSyntaxTokens = exports.markdownStringEqual = exports.isMarkdownString = exports.isEmptyMarkdownString = exports.MarkdownString = exports.MarkdownStringTextNewlineStyle = void 0;
    var MarkdownStringTextNewlineStyle;
    (function (MarkdownStringTextNewlineStyle) {
        MarkdownStringTextNewlineStyle[MarkdownStringTextNewlineStyle["Paragraph"] = 0] = "Paragraph";
        MarkdownStringTextNewlineStyle[MarkdownStringTextNewlineStyle["Break"] = 1] = "Break";
    })(MarkdownStringTextNewlineStyle || (exports.MarkdownStringTextNewlineStyle = MarkdownStringTextNewlineStyle = {}));
    class MarkdownString {
        constructor(value = '', isTrustedOrOptions = false) {
            this.value = value;
            if (typeof this.value !== 'string') {
                throw (0, errors_1.illegalArgument)('value');
            }
            if (typeof isTrustedOrOptions === 'boolean') {
                this.isTrusted = isTrustedOrOptions;
                this.supportThemeIcons = false;
                this.supportHtml = false;
            }
            else {
                this.isTrusted = isTrustedOrOptions.isTrusted ?? undefined;
                this.supportThemeIcons = isTrustedOrOptions.supportThemeIcons ?? false;
                this.supportHtml = isTrustedOrOptions.supportHtml ?? false;
            }
        }
        appendText(value, newlineStyle = 0 /* MarkdownStringTextNewlineStyle.Paragraph */) {
            this.value += escapeMarkdownSyntaxTokens(this.supportThemeIcons ? (0, iconLabels_1.escapeIcons)(value) : value) // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.
                .replace(/([ \t]+)/g, (_match, g1) => '&nbsp;'.repeat(g1.length)) // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.
                .replace(/\>/gm, '\\>') // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.
                .replace(/\n/g, newlineStyle === 1 /* MarkdownStringTextNewlineStyle.Break */ ? '\\\n' : '\n\n'); // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.
            return this;
        }
        appendMarkdown(value) {
            this.value += value;
            return this;
        }
        appendCodeblock(langId, code) {
            this.value += `\n${appendEscapedMarkdownCodeBlockFence(code, langId)}\n`;
            return this;
        }
        appendLink(target, label, title) {
            this.value += '[';
            this.value += this._escape(label, ']');
            this.value += '](';
            this.value += this._escape(String(target), ')');
            if (title) {
                this.value += ` "${this._escape(this._escape(title, '"'), ')')}"`;
            }
            this.value += ')';
            return this;
        }
        _escape(value, ch) {
            const r = new RegExp((0, strings_1.escapeRegExpCharacters)(ch), 'g');
            return value.replace(r, (match, offset) => {
                if (value.charAt(offset - 1) !== '\\') {
                    return `\\${match}`;
                }
                else {
                    return match;
                }
            });
        }
    }
    exports.MarkdownString = MarkdownString;
    function isEmptyMarkdownString(oneOrMany) {
        if (isMarkdownString(oneOrMany)) {
            return !oneOrMany.value;
        }
        else if (Array.isArray(oneOrMany)) {
            return oneOrMany.every(isEmptyMarkdownString);
        }
        else {
            return true;
        }
    }
    exports.isEmptyMarkdownString = isEmptyMarkdownString;
    function isMarkdownString(thing) {
        if (thing instanceof MarkdownString) {
            return true;
        }
        else if (thing && typeof thing === 'object') {
            return typeof thing.value === 'string'
                && (typeof thing.isTrusted === 'boolean' || typeof thing.isTrusted === 'object' || thing.isTrusted === undefined)
                && (typeof thing.supportThemeIcons === 'boolean' || thing.supportThemeIcons === undefined);
        }
        return false;
    }
    exports.isMarkdownString = isMarkdownString;
    function markdownStringEqual(a, b) {
        if (a === b) {
            return true;
        }
        else if (!a || !b) {
            return false;
        }
        else {
            return a.value === b.value
                && a.isTrusted === b.isTrusted
                && a.supportThemeIcons === b.supportThemeIcons
                && a.supportHtml === b.supportHtml
                && (a.baseUri === b.baseUri || !!a.baseUri && !!b.baseUri && (0, resources_1.isEqual)(uri_1.URI.from(a.baseUri), uri_1.URI.from(b.baseUri)));
        }
    }
    exports.markdownStringEqual = markdownStringEqual;
    function escapeMarkdownSyntaxTokens(text) {
        // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
        return text.replace(/[\\`*_{}[\]()#+\-!~]/g, '\\$&'); // CodeQL [SM02383] Backslash is escaped in the character class
    }
    exports.escapeMarkdownSyntaxTokens = escapeMarkdownSyntaxTokens;
    /**
     * @see https://github.com/microsoft/vscode/issues/193746
     */
    function appendEscapedMarkdownCodeBlockFence(code, langId) {
        const longestFenceLength = code.match(/^`+/gm)?.reduce((a, b) => (a.length > b.length ? a : b)).length ??
            0;
        const desiredFenceLength = longestFenceLength >= 3 ? longestFenceLength + 1 : 3;
        // the markdown result
        return [
            `${'`'.repeat(desiredFenceLength)}${langId}`,
            code,
            `${'`'.repeat(desiredFenceLength)}`,
        ].join('\n');
    }
    exports.appendEscapedMarkdownCodeBlockFence = appendEscapedMarkdownCodeBlockFence;
    function escapeDoubleQuotes(input) {
        return input.replace(/"/g, '&quot;');
    }
    exports.escapeDoubleQuotes = escapeDoubleQuotes;
    function removeMarkdownEscapes(text) {
        if (!text) {
            return text;
        }
        return text.replace(/\\([\\`*_{}[\]()#+\-.!~])/g, '$1');
    }
    exports.removeMarkdownEscapes = removeMarkdownEscapes;
    function parseHrefAndDimensions(href) {
        const dimensions = [];
        const splitted = href.split('|').map(s => s.trim());
        href = splitted[0];
        const parameters = splitted[1];
        if (parameters) {
            const heightFromParams = /height=(\d+)/.exec(parameters);
            const widthFromParams = /width=(\d+)/.exec(parameters);
            const height = heightFromParams ? heightFromParams[1] : '';
            const width = widthFromParams ? widthFromParams[1] : '';
            const widthIsFinite = isFinite(parseInt(width));
            const heightIsFinite = isFinite(parseInt(height));
            if (widthIsFinite) {
                dimensions.push(`width="${width}"`);
            }
            if (heightIsFinite) {
                dimensions.push(`height="${height}"`);
            }
        }
        return { href, dimensions };
    }
    exports.parseHrefAndDimensions = parseHrefAndDimensions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbENvbnRlbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2h0bWxDb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsSUFBa0IsOEJBR2pCO0lBSEQsV0FBa0IsOEJBQThCO1FBQy9DLDZGQUFhLENBQUE7UUFDYixxRkFBUyxDQUFBO0lBQ1YsQ0FBQyxFQUhpQiw4QkFBOEIsOENBQTlCLDhCQUE4QixRQUcvQztJQUVELE1BQWEsY0FBYztRQVExQixZQUNDLFFBQWdCLEVBQUUsRUFDbEIscUJBQTJJLEtBQUs7WUFFaEosSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ3BDLE1BQU0sSUFBQSx3QkFBZSxFQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hDLENBQUM7WUFFRCxJQUFJLE9BQU8sa0JBQWtCLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQzFCLENBQUM7aUJBQ0ksQ0FBQztnQkFDTCxJQUFJLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUM7Z0JBQzNELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLENBQUM7Z0JBQ3ZFLElBQUksQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQztZQUM1RCxDQUFDO1FBQ0YsQ0FBQztRQUVELFVBQVUsQ0FBQyxLQUFhLEVBQUUsK0RBQXVG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
//# sourceURL=../../../vs/base/common/htmlContent.js
})
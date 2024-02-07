(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters", "vs/base/common/strings", "vs/base/common/themables"], function (require, exports, filters_1, strings_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.matchesFuzzyIconAware = exports.parseLabelWithIcons = exports.getCodiconAriaLabel = exports.stripIcons = exports.markdownEscapeEscapedIcons = exports.escapeIcons = void 0;
    const iconStartMarker = '$(';
    const iconsRegex = new RegExp(`\\$\\(${themables_1.ThemeIcon.iconNameExpression}(?:${themables_1.ThemeIcon.iconModifierExpression})?\\)`, 'g'); // no capturing groups
    const escapeIconsRegex = new RegExp(`(\\\\)?${iconsRegex.source}`, 'g');
    function escapeIcons(text) {
        return text.replace(escapeIconsRegex, (match, escaped) => escaped ? match : `\\${match}`);
    }
    exports.escapeIcons = escapeIcons;
    const markdownEscapedIconsRegex = new RegExp(`\\\\${iconsRegex.source}`, 'g');
    function markdownEscapeEscapedIcons(text) {
        // Need to add an extra \ for escaping in markdown
        return text.replace(markdownEscapedIconsRegex, match => `\\${match}`);
    }
    exports.markdownEscapeEscapedIcons = markdownEscapeEscapedIcons;
    const stripIconsRegex = new RegExp(`(\\s)?(\\\\)?${iconsRegex.source}(\\s)?`, 'g');
    /**
     * Takes a label with icons (`$(iconId)xyz`)  and strips the icons out (`xyz`)
     */
    function stripIcons(text) {
        if (text.indexOf(iconStartMarker) === -1) {
            return text;
        }
        return text.replace(stripIconsRegex, (match, preWhitespace, escaped, postWhitespace) => escaped ? match : preWhitespace || postWhitespace || '');
    }
    exports.stripIcons = stripIcons;
    /**
     * Takes a label with icons (`$(iconId)xyz`), removes the icon syntax adds whitespace so that screen readers can read the text better.
     */
    function getCodiconAriaLabel(text) {
        if (!text) {
            return '';
        }
        return text.replace(/\$\((.*?)\)/g, (_match, codiconName) => ` ${codiconName} `).trim();
    }
    exports.getCodiconAriaLabel = getCodiconAriaLabel;
    const _parseIconsRegex = new RegExp(`\\$\\(${themables_1.ThemeIcon.iconNameCharacter}+\\)`, 'g');
    /**
     * Takes a label with icons (`abc $(iconId)xyz`) and returns the text (`abc xyz`) and the offsets of the icons (`[3]`)
     */
    function parseLabelWithIcons(input) {
        _parseIconsRegex.lastIndex = 0;
        let text = '';
        const iconOffsets = [];
        let iconsOffset = 0;
        while (true) {
            const pos = _parseIconsRegex.lastIndex;
            const match = _parseIconsRegex.exec(input);
            const chars = input.substring(pos, match?.index);
            if (chars.length > 0) {
                text += chars;
                for (let i = 0; i < chars.length; i++) {
                    iconOffsets.push(iconsOffset);
                }
            }
            if (!match) {
                break;
            }
            iconsOffset += match[0].length;
        }
        return { text, iconOffsets };
    }
    exports.parseLabelWithIcons = parseLabelWithIcons;
    function matchesFuzzyIconAware(query, target, enableSeparateSubstringMatching = false) {
        const { text, iconOffsets } = target;
        // Return early if there are no icon markers in the word to match against
        if (!iconOffsets || iconOffsets.length === 0) {
            return (0, filters_1.matchesFuzzy)(query, text, enableSeparateSubstringMatching);
        }
        // Trim the word to match against because it could have leading
        // whitespace now if the word started with an icon
        const wordToMatchAgainstWithoutIconsTrimmed = (0, strings_1.ltrim)(text, ' ');
        const leadingWhitespaceOffset = text.length - wordToMatchAgainstWithoutIconsTrimmed.length;
        // match on value without icon
        const matches = (0, filters_1.matchesFuzzy)(query, wordToMatchAgainstWithoutIconsTrimmed, enableSeparateSubstringMatching);
        // Map matches back to offsets with icon and trimming
        if (matches) {
            for (const match of matches) {
                const iconOffset = iconOffsets[match.start + leadingWhitespaceOffset] /* icon offsets at index */ + leadingWhitespaceOffset /* overall leading whitespace offset */;
                match.start += iconOffset;
                match.end += iconOffset;
            }
        }
        return matches;
    }
    exports.matchesFuzzyIconAware = matchesFuzzyIconAware;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbkxhYmVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vaWNvbkxhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDO0lBRTdCLE1BQU0sVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLFNBQVMscUJBQVMsQ0FBQyxrQkFBa0IsTUFBTSxxQkFBUyxDQUFDLHNCQUFzQixPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7SUFFOUksTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN4RSxTQUFnQixXQUFXLENBQUMsSUFBWTtRQUN2QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFGRCxrQ0FFQztJQUVELE1BQU0seUJBQXlCLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDOUUsU0FBZ0IsMEJBQTBCLENBQUMsSUFBWTtRQUN0RCxrREFBa0Q7UUFDbEQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFIRCxnRUFHQztJQUVELE1BQU0sZUFBZSxHQUFHLElBQUksTUFBTSxDQUFDLGdCQUFnQixVQUFVLENBQUMsTUFBTSxRQUFRLEVB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
//# sourceURL=../../../vs/base/common/iconLabels.js
})
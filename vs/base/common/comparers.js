(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lazy", "vs/base/common/path"], function (require, exports, lazy_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compareByPrefix = exports.compareAnything = exports.comparePaths = exports.compareFileExtensionsUnicode = exports.compareFileExtensionsLower = exports.compareFileExtensionsUpper = exports.compareFileExtensionsDefault = exports.compareFileExtensions = exports.compareFileNamesUnicode = exports.compareFileNamesLower = exports.compareFileNamesUpper = exports.compareFileNamesDefault = exports.compareFileNames = void 0;
    // When comparing large numbers of strings it's better for performance to create an
    // Intl.Collator object and use the function provided by its compare property
    // than it is to use String.prototype.localeCompare()
    // A collator with numeric sorting enabled, and no sensitivity to case, accents or diacritics.
    const intlFileNameCollatorBaseNumeric = new lazy_1.Lazy(() => {
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        return {
            collator,
            collatorIsNumeric: collator.resolvedOptions().numeric
        };
    });
    // A collator with numeric sorting enabled.
    const intlFileNameCollatorNumeric = new lazy_1.Lazy(() => {
        const collator = new Intl.Collator(undefined, { numeric: true });
        return {
            collator
        };
    });
    // A collator with numeric sorting enabled, and sensitivity to accents and diacritics but not case.
    const intlFileNameCollatorNumericCaseInsensitive = new lazy_1.Lazy(() => {
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'accent' });
        return {
            collator
        };
    });
    /** Compares filenames without distinguishing the name from the extension. Disambiguates by unicode comparison. */
    function compareFileNames(one, other, caseSensitive = false) {
        const a = one || '';
        const b = other || '';
        const result = intlFileNameCollatorBaseNumeric.value.collator.compare(a, b);
        // Using the numeric option will make compare(`foo1`, `foo01`) === 0. Disambiguate.
        if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && result === 0 && a !== b) {
            return a < b ? -1 : 1;
        }
        return result;
    }
    exports.compareFileNames = compareFileNames;
    /** Compares full filenames without grouping by case. */
    function compareFileNamesDefault(one, other) {
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        one = one || '';
        other = other || '';
        return compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileNamesDefault = compareFileNamesDefault;
    /** Compares full filenames grouping uppercase names before lowercase. */
    function compareFileNamesUpper(one, other) {
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        one = one || '';
        other = other || '';
        return compareCaseUpperFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileNamesUpper = compareFileNamesUpper;
    /** Compares full filenames grouping lowercase names before uppercase. */
    function compareFileNamesLower(one, other) {
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        one = one || '';
        other = other || '';
        return compareCaseLowerFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileNamesLower = compareFileNamesLower;
    /** Compares full filenames by unicode value. */
    function compareFileNamesUnicode(one, other) {
        one = one || '';
        other = other || '';
        if (one === other) {
            return 0;
        }
        return one < other ? -1 : 1;
    }
    exports.compareFileNamesUnicode = compareFileNamesUnicode;
    /** Compares filenames by extension, then by name. Disambiguates by unicode comparison. */
    function compareFileExtensions(one, other) {
        const [oneName, oneExtension] = extractNameAndExtension(one);
        const [otherName, otherExtension] = extractNameAndExtension(other);
        let result = intlFileNameCollatorBaseNumeric.value.collator.compare(oneExtension, otherExtension);
        if (result === 0) {
            // Using the numeric option will  make compare(`foo1`, `foo01`) === 0. Disambiguate.
            if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && oneExtension !== otherExtension) {
                return oneExtension < otherExtension ? -1 : 1;
            }
            // Extensions are equal, compare filenames
            result = intlFileNameCollatorBaseNumeric.value.collator.compare(oneName, otherName);
            if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && result === 0 && oneName !== otherName) {
                return oneName < otherName ? -1 : 1;
            }
        }
        return result;
    }
    exports.compareFileExtensions = compareFileExtensions;
    /** Compares filenames by extension, then by full filename. Mixes uppercase and lowercase names together. */
    function compareFileExtensionsDefault(one, other) {
        one = one || '';
        other = other || '';
        const oneExtension = extractExtension(one);
        const otherExtension = extractExtension(other);
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
        return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) ||
            compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileExtensionsDefault = compareFileExtensionsDefault;
    /** Compares filenames by extension, then case, then full filename. Groups uppercase names before lowercase. */
    function compareFileExtensionsUpper(one, other) {
        one = one || '';
        other = other || '';
        const oneExtension = extractExtension(one);
        const otherExtension = extractExtension(other);
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
        return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) ||
            compareCaseUpperFirst(one, other) ||
            compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileExtensionsUpper = compareFileExtensionsUpper;
    /** Compares filenames by extension, then case, then full filename. Groups lowercase names before uppercase. */
    function compareFileExtensionsLower(one, other) {
        one = one || '';
        other = other || '';
        const oneExtension = extractExtension(one);
        const otherExtension = extractExtension(other);
        const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
        const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
        return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) ||
            compareCaseLowerFirst(one, other) ||
            compareAndDisambiguateByLength(collatorNumeric, one, other);
    }
    exports.compareFileExtensionsLower = compareFileExtensionsLower;
    /** Compares filenames by case-insensitive extension unicode value, then by full filename unicode value. */
    function compareFileExtensionsUnicode(one, other) {
        one = one || '';
        other = other || '';
        const oneExtension = extractExtension(one).toLowerCase();
        const otherExtension = extractExtension(other).toLowerCase();
        // Check for extension differences
        if (oneExtension !== otherExtension) {
            return oneExtension < otherExtension ? -1 : 1;
        }
        // Check for full filename differences.
        if (one !== other) {
            return one < other ? -1 : 1;
        }
        return 0;
    }
    exports.compareFileExtensionsUnicode = compareFileExtensionsUnicode;
    const FileNameMatch = /^(.*?)(\.([^.]*))?$/;
    /** Extracts the name and extension from a full filename, with optional special handling for dotfiles */
    function extractNameAndExtension(str, dotfilesAsNames = false) {
        const match = str ? FileNameMatch.exec(str) : [];
        let result = [(match && match[1]) || '', (match && match[3]) || ''];
        // if the dotfilesAsNames option is selected, treat an empty filename with an extension
        // or a filename that starts with a dot, as a dotfile name
        if (dotfilesAsNames && (!result[0] && result[1] || result[0] && result[0].charAt(0) === '.')) {
            result = [result[0] + '.' + result[1], ''];
        }
        return result;
    }
    /** Extracts the extension from a full filename. Treats dotfiles as names, not extensions. */
    function extractExtension(str) {
        const match = str ? FileNameMatch.exec(str) : [];
        return (match && match[1] && match[1].charAt(0) !== '.' && match[3]) || '';
    }
    function compareAndDisambiguateByLength(collator, one, other) {
        // Check for differences
        const result = collator.compare(one, other);
        if (result !== 0) {
            return result;
        }
        // In a numeric comparison, `foo1` and `foo01` will compare as equivalent.
        // Disambiguate by sorting the shorter string first.
        if (one.length !== other.length) {
            return one.length < other.length ? -1 : 1;
        }
        return 0;
    }
    /** @returns `true` if the string is starts with a lowercase letter. Otherwise, `false`. */
    function startsWithLower(string) {
        const character = string.charAt(0);
        return (character.toLocaleUpperCase() !== character) ? true : false;
    }
    /** @returns `true` if the string starts with an uppercase letter. Otherwise, `false`. */
    function startsWithUpper(string) {
        const character = string.charAt(0);
        return (character.toLocaleLowerCase() !== character) ? true : false;
    }
    /**
     * Compares the case of the provided strings - lowercase before uppercase
     *
     * @returns
     * ```text
     *   -1 if one is lowercase and other is uppercase
     *    1 if one is uppercase and other is lowercase
     *    0 otherwise
     * ```
     */
    function compareCaseLowerFirst(one, other) {
        if (startsWithLower(one) && startsWithUpper(other)) {
            return -1;
        }
        return (startsWithUpper(one) && startsWithLower(other)) ? 1 : 0;
    }
    /**
     * Compares the case of the provided strings - uppercase before lowercase
     *
     * @returns
     * ```text
     *   -1 if one is uppercase and other is lowercase
     *    1 if one is lowercase and other is uppercase
     *    0 otherwise
     * ```
     */
    function compareCaseUpperFirst(one, other) {
        if (startsWithUpper(one) && startsWithLower(other)) {
            return -1;
        }
        return (startsWithLower(one) && startsWithUpper(other)) ? 1 : 0;
    }
    function comparePathComponents(one, other, caseSensitive = false) {
        if (!caseSensitive) {
            one = one && one.toLowerCase();
            other = other && other.toLowerCase();
        }
        if (one === other) {
            return 0;
        }
        return one < other ? -1 : 1;
    }
    function comparePaths(one, other, caseSensitive = false) {
        const oneParts = one.split(path_1.sep);
        const otherParts = other.split(path_1.sep);
        const lastOne = oneParts.length - 1;
        const lastOther = otherParts.length - 1;
        let endOne, endOther;
        for (let i = 0;; i++) {
            endOne = lastOne === i;
            endOther = lastOther === i;
            if (endOne && endOther) {
                return compareFileNames(oneParts[i], otherParts[i], caseSensitive);
            }
            else if (endOne) {
                return -1;
            }
            else if (endOther) {
                return 1;
            }
            const result = comparePathComponents(oneParts[i], otherParts[i], caseSensitive);
            if (result !== 0) {
                return result;
            }
        }
    }
    exports.comparePaths = comparePaths;
    function compareAnything(one, other, lookFor) {
        const elementAName = one.toLowerCase();
        const elementBName = other.toLowerCase();
        // Sort prefix matches over non prefix matches
        const prefixCompare = compareByPrefix(one, other, lookFor);
        if (prefixCompare) {
            return prefixCompare;
        }
        // Sort suffix matches over non suffix matches
        const elementASuffixMatch = elementAName.endsWith(lookFor);
        const elementBSuffixMatch = elementBName.endsWith(lookFor);
        if (elementASuffixMatch !== elementBSuffixMatch) {
            return elementASuffixMatch ? -1 : 1;
        }
        // Understand file names
        const r = compareFileNames(elementAName, elementBName);
        if (r !== 0) {
            return r;
        }
        // Compare by name
        return elementAName.localeCompare(elementBName);
    }
    exports.compareAnything = compareAnything;
    function compareByPrefix(one, other, lookFor) {
        const elementAName = one.toLowerCase();
        const elementBName = other.toLowerCase();
        // Sort prefix matches over non prefix matches
        const elementAPrefixMatch = elementAName.startsWith(lookFor);
        const elementBPrefixMatch = elementBName.startsWith(lookFor);
        if (elementAPrefixMatch !== elementBPrefixMatch) {
            return elementAPrefixMatch ? -1 : 1;
        }
        // Same prefix: Sort shorter matches to the top to have those on top that match more precisely
        else if (elementAPrefixMatch && elementBPrefixMatch) {
            if (elementAName.length < elementBName.length) {
                return -1;
            }
            if (elementAName.length > elementBName.length) {
                return 1;
            }
        }
        return 0;
    }
    exports.compareByPrefix = compareByPrefix;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9jb21wYXJlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLG1GQUFtRjtJQUNuRiw2RUFBNkU7SUFDN0UscURBQXFEO0lBRXJELDhGQUE4RjtJQUM5RixNQUFNLCtCQUErQixHQUFrRSxJQUFJLFdBQUksQ0FBQyxHQUFHLEVBQUU7UUFDcEgsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDdEYsT0FBTztZQUNOLFFBQVE7WUFDUixpQkFBaUIsRUFBRSxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTztTQUNyRCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCwyQ0FBMkM7SUFDM0MsTUFBTSwyQkFBMkIsR0FBc0MsSUFBSSxXQUFJLENBQUMsR0FBRyxFQUFFO1FBQ3BGLE1BQU0sUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNqRSxPQUFPO1lBQ04sUUFBUTtTQUNSLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILG1HQUFtRztJQUNuRyxNQUFNLDBDQUEwQyxHQUFzQyxJQUFJLFdBQUksQ0FBQyxHQUFHLEVBQUU7UUFDbkcsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDeEYsT0FBTztZQUNOLFFBQVE7U0FDUixDQUFDO0lBQ0gsQ0FB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
//# sourceURL=../../../vs/base/common/comparers.js
})
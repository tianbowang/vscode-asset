/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lazy"], function (require, exports, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.winDrivePrefix = exports.detectLinks = exports.toLinkSuffix = exports.getLinkSuffix = exports.detectLinkSuffixes = exports.removeLinkQueryString = exports.removeLinkSuffix = void 0;
    /**
     * A regex that extracts the link suffix which contains line and column information. The link suffix
     * must terminate at the end of line.
     */
    const linkSuffixRegexEol = new lazy_1.Lazy(() => generateLinkSuffixRegex(true));
    /**
     * A regex that extracts the link suffix which contains line and column information.
     */
    const linkSuffixRegex = new lazy_1.Lazy(() => generateLinkSuffixRegex(false));
    function generateLinkSuffixRegex(eolOnly) {
        let ri = 0;
        let ci = 0;
        let rei = 0;
        let cei = 0;
        function r() {
            return `(?<row${ri++}>\\d+)`;
        }
        function c() {
            return `(?<col${ci++}>\\d+)`;
        }
        function re() {
            return `(?<rowEnd${rei++}>\\d+)`;
        }
        function ce() {
            return `(?<colEnd${cei++}>\\d+)`;
        }
        const eolSuffix = eolOnly ? '$' : '';
        // The comments in the regex below use real strings/numbers for better readability, here's
        // the legend:
        // - Path    = foo
        // - Row     = 339
        // - Col     = 12
        // - RowEnd  = 341
        // - ColEnd  = 789
        //
        // These all support single quote ' in the place of " and [] in the place of ()
        //
        // See the tests for an exhaustive list of all supported formats
        const lineAndColumnRegexClauses = [
            // foo:339
            // foo:339:12
            // foo:339:12-789
            // foo:339:12-341.789
            // foo:339.12
            // foo 339
            // foo 339:12                              [#140780]
            // foo 339.12
            // foo#339
            // foo#339:12                              [#190288]
            // foo#339.12
            // "foo",339
            // "foo",339:12
            // "foo",339.12
            // "foo",339.12-789
            // "foo",339.12-341.789
            `(?::|#| |['"],)${r()}([:.]${c()}(?:-(?:${re()}\\.)?${ce()})?)?` + eolSuffix,
            // The quotes below are optional           [#171652]
            // "foo", line 339                         [#40468]
            // "foo", line 339, col 12
            // "foo", line 339, column 12
            // "foo":line 339
            // "foo":line 339, col 12
            // "foo":line 339, column 12
            // "foo": line 339
            // "foo": line 339, col 12
            // "foo": line 339, column 12
            // "foo" on line 339
            // "foo" on line 339, col 12
            // "foo" on line 339, column 12
            // "foo" line 339 column 12
            // "foo", line 339, character 12           [#171880]
            // "foo", line 339, characters 12-789      [#171880]
            // "foo", lines 339-341                    [#171880]
            // "foo", lines 339-341, characters 12-789 [#178287]
            `['"]?(?:,? |: ?| on )lines? ${r()}(?:-${re()})?(?:,? (?:col(?:umn)?|characters?) ${c()}(?:-${ce()})?)?` + eolSuffix,
            // foo(339)
            // foo(339,12)
            // foo(339, 12)
            // foo (339)
            //   ...
            // foo: (339)
            //   ...
            `:? ?[\\[\\(]${r()}(?:, ?${c()})?[\\]\\)]` + eolSuffix,
        ];
        const suffixClause = lineAndColumnRegexClauses
            // Join all clauses together
            .join('|')
            // Convert spaces to allow the non-breaking space char (ascii 160)
            .replace(/ /g, `[${'\u00A0'} ]`);
        return new RegExp(`(${suffixClause})`, eolOnly ? undefined : 'g');
    }
    /**
     * Removes the optional link suffix which contains line and column information.
     * @param link The link to use.
     */
    function removeLinkSuffix(link) {
        const suffix = getLinkSuffix(link)?.suffix;
        if (!suffix) {
            return link;
        }
        return link.substring(0, suffix.index);
    }
    exports.removeLinkSuffix = removeLinkSuffix;
    /**
     * Removes any query string from the link.
     * @param link The link to use.
     */
    function removeLinkQueryString(link) {
        // Skip ? in UNC paths
        const start = link.startsWith('\\\\?\\') ? 4 : 0;
        const index = link.indexOf('?', start);
        if (index === -1) {
            return link;
        }
        return link.substring(0, index);
    }
    exports.removeLinkQueryString = removeLinkQueryString;
    function detectLinkSuffixes(line) {
        // Find all suffixes on the line. Since the regex global flag is used, lastIndex will be updated
        // in place such that there are no overlapping matches.
        let match;
        const results = [];
        linkSuffixRegex.value.lastIndex = 0;
        while ((match = linkSuffixRegex.value.exec(line)) !== null) {
            const suffix = toLinkSuffix(match);
            if (suffix === null) {
                break;
            }
            results.push(suffix);
        }
        return results;
    }
    exports.detectLinkSuffixes = detectLinkSuffixes;
    /**
     * Returns the optional link suffix which contains line and column information.
     * @param link The link to parse.
     */
    function getLinkSuffix(link) {
        return toLinkSuffix(linkSuffixRegexEol.value.exec(link));
    }
    exports.getLinkSuffix = getLinkSuffix;
    function toLinkSuffix(match) {
        const groups = match?.groups;
        if (!groups || match.length < 1) {
            return null;
        }
        return {
            row: parseIntOptional(groups.row0 || groups.row1 || groups.row2),
            col: parseIntOptional(groups.col0 || groups.col1 || groups.col2),
            rowEnd: parseIntOptional(groups.rowEnd0 || groups.rowEnd1 || groups.rowEnd2),
            colEnd: parseIntOptional(groups.colEnd0 || groups.colEnd1 || groups.colEnd2),
            suffix: { index: match.index, text: match[0] }
        };
    }
    exports.toLinkSuffix = toLinkSuffix;
    function parseIntOptional(value) {
        if (value === undefined) {
            return value;
        }
        return parseInt(value);
    }
    // This defines valid path characters for a link with a suffix, the first `[]` of the regex includes
    // characters the path is not allowed to _start_ with, the second `[]` includes characters not
    // allowed at all in the path. If the characters show up in both regexes the link will stop at that
    // character, otherwise it will stop at a space character.
    const linkWithSuffixPathCharacters = /(?<path>(?:file:\/\/\/)?[^\s\|<>\[\({][^\s\|<>]*)$/;
    function detectLinks(line, os) {
        // 1: Detect all links on line via suffixes first
        const results = detectLinksViaSuffix(line);
        // 2: Detect all links without suffixes and merge non-conflicting ranges into the results
        const noSuffixPaths = detectPathsNoSuffix(line, os);
        binaryInsertList(results, noSuffixPaths);
        return results;
    }
    exports.detectLinks = detectLinks;
    function binaryInsertList(list, newItems) {
        if (list.length === 0) {
            list.push(...newItems);
        }
        for (const item of newItems) {
            binaryInsert(list, item, 0, list.length);
        }
    }
    function binaryInsert(list, newItem, low, high) {
        if (list.length === 0) {
            list.push(newItem);
            return;
        }
        if (low > high) {
            return;
        }
        // Find the index where the newItem would be inserted
        const mid = Math.floor((low + high) / 2);
        if (mid >= list.length ||
            (newItem.path.index < list[mid].path.index && (mid === 0 || newItem.path.index > list[mid - 1].path.index))) {
            // Check if it conflicts with an existing link before adding
            if (mid >= list.length ||
                (newItem.path.index + newItem.path.text.length < list[mid].path.index && (mid === 0 || newItem.path.index > list[mid - 1].path.index + list[mid - 1].path.text.length))) {
                list.splice(mid, 0, newItem);
            }
            return;
        }
        if (newItem.path.index > list[mid].path.index) {
            binaryInsert(list, newItem, mid + 1, high);
        }
        else {
            binaryInsert(list, newItem, low, mid - 1);
        }
    }
    function detectLinksViaSuffix(line) {
        const results = [];
        // 1: Detect link suffixes on the line
        const suffixes = detectLinkSuffixes(line);
        for (const suffix of suffixes) {
            const beforeSuffix = line.substring(0, suffix.suffix.index);
            const possiblePathMatch = beforeSuffix.match(linkWithSuffixPathCharacters);
            if (possiblePathMatch && possiblePathMatch.index !== undefined && possiblePathMatch.groups?.path) {
                let linkStartIndex = possiblePathMatch.index;
                let path = possiblePathMatch.groups.path;
                // Extract a path prefix if it exists (not part of the path, but part of the underlined
                // section)
                let prefix = undefined;
                const prefixMatch = path.match(/^(?<prefix>['"]+)/);
                if (prefixMatch?.groups?.prefix) {
                    prefix = {
                        index: linkStartIndex,
                        text: prefixMatch.groups.prefix
                    };
                    path = path.substring(prefix.text.length);
                    // If there are multiple characters in the prefix, trim the prefix if the _first_
                    // suffix character is the same as the last prefix character. For example, for the
                    // text `echo "'foo' on line 1"`:
                    //
                    // - Prefix='
                    // - Path=foo
                    // - Suffix=' on line 1
                    //
                    // If this fails on a multi-character prefix, just keep the original.
                    if (prefixMatch.groups.prefix.length > 1) {
                        if (suffix.suffix.text[0].match(/['"]/) && prefixMatch.groups.prefix[prefixMatch.groups.prefix.length - 1] === suffix.suffix.text[0]) {
                            const trimPrefixAmount = prefixMatch.groups.prefix.length - 1;
                            prefix.index += trimPrefixAmount;
                            prefix.text = prefixMatch.groups.prefix[prefixMatch.groups.prefix.length - 1];
                            linkStartIndex += trimPrefixAmount;
                        }
                    }
                }
                results.push({
                    path: {
                        index: linkStartIndex + (prefix?.text.length || 0),
                        text: path
                    },
                    prefix,
                    suffix
                });
            }
        }
        return results;
    }
    var RegexPathConstants;
    (function (RegexPathConstants) {
        RegexPathConstants["PathPrefix"] = "(?:\\.\\.?|\\~|file://)";
        RegexPathConstants["PathSeparatorClause"] = "\\/";
        // '":; are allowed in paths but they are often separators so ignore them
        // Also disallow \\ to prevent a catastropic backtracking case #24795
        RegexPathConstants["ExcludedPathCharactersClause"] = "[^\\0<>\\?\\s!`&*()'\":;\\\\]";
        RegexPathConstants["ExcludedStartPathCharactersClause"] = "[^\\0<>\\s!`&*()\\[\\]'\":;\\\\]";
        RegexPathConstants["WinOtherPathPrefix"] = "\\.\\.?|\\~";
        RegexPathConstants["WinPathSeparatorClause"] = "(?:\\\\|\\/)";
        RegexPathConstants["WinExcludedPathCharactersClause"] = "[^\\0<>\\?\\|\\/\\s!`&*()'\":;]";
        RegexPathConstants["WinExcludedStartPathCharactersClause"] = "[^\\0<>\\?\\|\\/\\s!`&*()\\[\\]'\":;]";
    })(RegexPathConstants || (RegexPathConstants = {}));
    /**
     * A regex that matches non-Windows paths, such as `/foo`, `~/foo`, `./foo`, `../foo` and
     * `foo/bar`.
     */
    const unixLocalLinkClause = '(?:(?:' + RegexPathConstants.PathPrefix + '|(?:' + RegexPathConstants.ExcludedStartPathCharactersClause + RegexPathConstants.ExcludedPathCharactersClause + '*))?(?:' + RegexPathConstants.PathSeparatorClause + '(?:' + RegexPathConstants.ExcludedPathCharactersClause + ')+)+)';
    /**
     * A regex clause that matches the start of an absolute path on Windows, such as: `C:`, `c:`,
     * `file:///c:` (uri) and `\\?\C:` (UNC path).
     */
    exports.winDrivePrefix = '(?:\\\\\\\\\\?\\\\|file:\\/\\/\\/)?[a-zA-Z]:';
    /**
     * A regex that matches Windows paths, such as `\\?\c:\foo`, `c:\foo`, `~\foo`, `.\foo`, `..\foo`
     * and `foo\bar`.
     */
    const winLocalLinkClause = '(?:(?:' + `(?:${exports.winDrivePrefix}|${RegexPathConstants.WinOtherPathPrefix})` + '|(?:' + RegexPathConstants.WinExcludedStartPathCharactersClause + RegexPathConstants.WinExcludedPathCharactersClause + '*))?(?:' + RegexPathConstants.WinPathSeparatorClause + '(?:' + RegexPathConstants.WinExcludedPathCharactersClause + ')+)+)';
    function detectPathsNoSuffix(line, os) {
        const results = [];
        const regex = new RegExp(os === 1 /* OperatingSystem.Windows */ ? winLocalLinkClause : unixLocalLinkClause, 'g');
        let match;
        while ((match = regex.exec(line)) !== null) {
            let text = match[0];
            let index = match.index;
            if (!text) {
                // Something matched but does not comply with the given match index, since this would
                // most likely a bug the regex itself we simply do nothing here
                break;
            }
            // Adjust the link range to exclude a/ and b/ if it looks like a git diff
            if (
            // --- a/foo/bar
            // +++ b/foo/bar
            ((line.startsWith('--- a/') || line.startsWith('+++ b/')) && index === 4) ||
                // diff --git a/foo/bar b/foo/bar
                (line.startsWith('diff --git') && (text.startsWith('a/') || text.startsWith('b/')))) {
                text = text.substring(2);
                index += 2;
            }
            results.push({
                path: {
                    index,
                    text
                },
                prefix: undefined,
                suffix: undefined
            });
        }
        return results;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rUGFyc2luZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL2xpbmtzL2Jyb3dzZXIvdGVybWluYWxMaW5rUGFyc2luZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE4QmhHOzs7T0FHRztJQUNILE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxXQUFJLENBQVMsR0FBRyxFQUFFLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRjs7T0FFRztJQUNILE1BQU0sZUFBZSxHQUFHLElBQUksV0FBSSxDQUFTLEdBQUcsRUFBRSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFL0UsU0FBUyx1QkFBdUIsQ0FBQyxPQUFnQjtRQUNoRCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDWixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDWixTQUFTLENBQUM7WUFDVCxPQUFPLFNBQVMsRUFBRSxFQUFFLFFBQVEsQ0FBQztRQUM5QixDQUFDO1FBQ0QsU0FBUyxDQUFDO1lBQ1QsT0FBTyxTQUFTLEVBQUUsRUFBRSxRQUFRLENBQUM7UUFDOUIsQ0FBQztRQUNELFNBQVMsRUFBRTtZQUNWLE9BQU8sWUFBWSxHQUFHLEVBQUUsUUFBUSxDQUFDO1FBQ2xDLENBQUM7UUFDRCxTQUFTLEVBQUU7WUFDVixPQUFPLFlBQVksR0FBRyxFQUFFLFFBQVEsQ0FBQztRQUNsQyxDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVyQywwRkFBMEY7UUFDMUYsY0FBYztRQUNkLGtCQUFrQjtRQUNsQixrQkFBa0I7UUFDbEIsaUJBQWlCO1FBQ2pCLGtCQUFrQjtRQUNsQixrQkFBa0I7UUFDbEIsRUFBRTtRQUNGLCtFQUErRTtRQUMvRSxFQUFFO1FBQ0YsZ0VBQWdFO1FBQ2hFLE1BQU0seUJBQXlCLEdBQUc7WUFDakMsVUFBVTtZQUNWLGFBQWE7WUFDYixpQkFBaUI7WUFDakIscUJBQXFCO1lBQ3JCLGFBQWE7WUFDYixVQUFVO1lBQ1Ysb0RBQW9EO1lBQ3BELGFBQWE7WUFDYixVQUFVO1lBQ1Ysb0RBQW9EO1lBQ3BELGFBQWE7WUFDYixZQUFZO1lBQ1osZUFBZTtZQUNmLGVBQWU7WUFDZixtQkFBbUI7WUFDbkIsdUJBQXVCO1lBQ3ZCLGtCQUFrQixDQUFDLEVBQUUsUUFBUSxDQUFDLEVBQUUsVUFBVSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsTUFBTSxHQUFHLFNBQVM7WUFDNUUsb0RBQW9EO1lBQ3BELG1EQUFtRDtZQUNuRCwwQkFBMEI7WUFDMUIsNkJBQTZCO1lBQzdCLGlCQUFpQjtZQUNqQix5QkFBeUI7WUFDekIsNEJBQTRCO1lBQzVCLGtCQUFrQjtZQUNsQiwwQkFBMEI7WUFDMUIsNkJBQTZCO1lBQzdCLG9CQUFvQjtZQUNwQiw0QkFBNEI7WUFDNUIsK0JBQStCO1lBQy9CLDJCQUEyQjtZQUMzQixvREFBb0Q7WUFDcEQsb0RBQW9EO1lBQ3BELG9EQUFvRDtZQUNwRCxvREFBb0Q7WUFDcEQsK0JBQStCLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSx1Q0FBdUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sR0FBRyxTQUFTO1lBQ3BILFdBQVc7WUFDWCxjQUFjO1lBQ2QsZUFBZTtZQUNmLFlBQVk7WUFDWixRQUFRO1lBQ1IsYUFBYTtZQUNiLFFBQVE7WUFDUixlQUFlLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxZQUFZLEdBQUcsU0FBUztTQUN0RCxDQUFDO1FBRUYsTUFBTSxZQUFZLEdBQUcseUJBQXlCO1lBQzdDLDRCQUE0QjthQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1Ysa0VBQWtFO2FBQ2pFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxRQUFRLElBQUksQ0FBQyxDQUFDO1FBRWxDLE9BQU8sSUFBSSxNQUFNLENBQUMsSUFBSSxZQUFZLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGdCQUFnQixDQUFDLElBQVk7UUFDNUMsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQztRQUMzQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDYixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBTkQsNENBTUM7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixxQkFBcUIsQ0FBQyxJQUFZO1FBQ2pELHNCQUFzQjtRQUN0QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2QyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2xCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQVJELHNEQVFDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsSUFBWTtRQUM5QyxnR0FBZ0c7UUFDaEcsdURBQXVEO1FBQ3ZELElBQUksS0FBNkIsQ0FBQztRQUNsQyxNQUFNLE9BQU8sR0FBa0IsRUFBRSxDQUFDO1FBQ2xDLGVBQWUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNwQyxPQUFPLENBQUMsS0FBSyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDNUQsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25DLElBQUksTUFBTSxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUNyQixNQUFNO1lBQ1AsQ0FBQztZQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFkRCxnREFjQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGFBQWEsQ0FBQyxJQUFZO1FBQ3pDLE9BQU8sWUFBWSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRkQsc0NBRUM7SUFFRCxTQUFnQixZQUFZLENBQUMsS0FBNkI7UUFDekQsTUFBTSxNQUFNLEdBQUcsS0FBSyxFQUFFLE1BQU0sQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDakMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ0QsT0FBTztZQUNOLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQztZQUNoRSxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEUsTUFBTSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQzVFLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUM1RSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQzlDLENBQUM7SUFDSCxDQUFDO0lBWkQsb0NBWUM7SUFFRCxTQUFTLGdCQUFnQixDQUFDLEtBQXlCO1FBQ2xELElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3pCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUNELE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxvR0FBb0c7SUFDcEcsOEZBQThGO0lBQzlGLG1HQUFtRztJQUNuRywwREFBMEQ7SUFDMUQsTUFBTSw0QkFBNEIsR0FBRyxvREFBb0QsQ0FBQztJQUUxRixTQUFnQixXQUFXLENBQUMsSUFBWSxFQUFFLEVBQW1CO1FBQzVELGlEQUFpRDtRQUNqRCxNQUFNLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzQyx5RkFBeUY7UUFDekYsTUFBTSxhQUFhLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELGdCQUFnQixDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztRQUV6QyxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBVEQsa0NBU0M7SUFFRCxTQUFTLGdCQUFnQixDQUFDLElBQW1CLEVBQUUsUUFBdUI7UUFDckUsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBQ0QsS0FBSyxNQUFNLElBQUksSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUM3QixZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLENBQUM7SUFDRixDQUFDO0lBRUQsU0FBUyxZQUFZLENBQUMsSUFBbUIsRUFBRSxPQUFvQixFQUFFLEdBQVcsRUFBRSxJQUFZO1FBQ3pGLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25CLE9BQU87UUFDUixDQUFDO1FBQ0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7WUFDaEIsT0FBTztRQUNSLENBQUM7UUFDRCxxREFBcUQ7UUFDckQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6QyxJQUNDLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTTtZQUNsQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUMxRyxDQUFDO1lBQ0YsNERBQTREO1lBQzVELElBQ0MsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNO2dCQUNsQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUN0SyxDQUFDO2dCQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBQ0QsT0FBTztRQUNSLENBQUM7UUFDRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDL0MsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxDQUFDO2FBQU0sQ0FBQztZQUNQLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0MsQ0FBQztJQUNGLENBQUM7SUFFRCxTQUFTLG9CQUFvQixDQUFDLElBQVk7UUFDekMsTUFBTSxPQUFPLEdBQWtCLEVBQUUsQ0FBQztRQUVsQyxzQ0FBc0M7UUFDdEMsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsS0FBSyxNQUFNLE1BQU0sSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUMvQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVELE1BQU0saUJBQWlCLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQzNFLElBQUksaUJBQWlCLElBQUksaUJBQWlCLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7Z0JBQ2xHLElBQUksY0FBYyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQztnQkFDN0MsSUFBSSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDekMsdUZBQXVGO2dCQUN2RixXQUFXO2dCQUNYLElBQUksTUFBTSxHQUFrQyxTQUFTLENBQUM7Z0JBQ3RELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxXQUFXLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO29CQUNqQyxNQUFNLEdBQUc7d0JBQ1IsS0FBSyxFQUFFLGNBQWM7d0JBQ3JCLElBQUksRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU07cUJBQy9CLENBQUM7b0JBQ0YsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFFMUMsaUZBQWlGO29CQUNqRixrRkFBa0Y7b0JBQ2xGLGlDQUFpQztvQkFDakMsRUFBRTtvQkFDRixhQUFhO29CQUNiLGFBQWE7b0JBQ2IsdUJBQXVCO29CQUN2QixFQUFFO29CQUNGLHFFQUFxRTtvQkFDckUsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQzFDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDOzRCQUN0SSxNQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7NEJBQzlELE1BQU0sQ0FBQyxLQUFLLElBQUksZ0JBQWdCLENBQUM7NEJBQ2pDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUM5RSxjQUFjLElBQUksZ0JBQWdCLENBQUM7d0JBQ3BDLENBQUM7b0JBQ0YsQ0FBQztnQkFDRixDQUFDO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ1osSUFBSSxFQUFFO3dCQUNMLEtBQUssRUFBRSxjQUFjLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7d0JBQ2xELElBQUksRUFBRSxJQUFJO3FCQUNWO29CQUNELE1BQU07b0JBQ04sTUFBTTtpQkFDTixDQUFDLENBQUM7WUFDSixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFRCxJQUFLLGtCQVlKO0lBWkQsV0FBSyxrQkFBa0I7UUFDdEIsNERBQXdDLENBQUE7UUFDeEMsaURBQTJCLENBQUE7UUFDM0IseUVBQXlFO1FBQ3pFLHFFQUFxRTtRQUNyRSxvRkFBOEQsQ0FBQTtRQUM5RCw0RkFBc0UsQ0FBQTtRQUV0RSx3REFBa0MsQ0FBQTtRQUNsQyw2REFBdUMsQ0FBQTtRQUN2Qyx5RkFBbUUsQ0FBQTtRQUNuRSxvR0FBOEUsQ0FBQTtJQUMvRSxDQUFDLEVBWkksa0JBQWtCLEtBQWxCLGtCQUFrQixRQVl0QjtJQUVEOzs7T0FHRztJQUNILE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxHQUFHLGtCQUFrQixDQUFDLFVBQVUsR0FBRyxNQUFNLEdBQUcsa0JBQWtCLENBQUMsaUNBQWlDLEdBQUcsa0JBQWtCLENBQUMsNEJBQTRCLEdBQUcsU0FBUyxHQUFHLGtCQUFrQixDQUFDLG1CQUFtQixHQUFHLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyw0QkFBNEIsR0FBRyxPQUFPLENBQUM7SUFFaFQ7OztPQUdHO0lBQ1UsUUFBQSxjQUFjLEdBQUcsOENBQThDLENBQUM7SUFFN0U7OztPQUdHO0lBQ0gsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLEdBQUcsTUFBTSxzQkFBYyxJQUFJLGtCQUFrQixDQUFDLGtCQUFrQixHQUFHLEdBQUcsTUFBTSxHQUFHLGtCQUFrQixDQUFDLG9DQUFvQyxHQUFHLGtCQUFrQixDQUFDLCtCQUErQixHQUFHLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLEdBQUcsa0JBQWtCLENBQUMsK0JBQStCLEdBQUcsT0FBTyxDQUFDO0lBRTlWLFNBQVMsbUJBQW1CLENBQUMsSUFBWSxFQUFFLEVBQW1CO1FBQzdELE1BQU0sT0FBTyxHQUFrQixFQUFFLENBQUM7UUFFbEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxvQ0FBNEIsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pHLElBQUksS0FBSyxDQUFDO1FBQ1YsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDNUMsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDeEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNYLHFGQUFxRjtnQkFDckYsK0RBQStEO2dCQUMvRCxNQUFNO1lBQ1AsQ0FBQztZQUVELHlFQUF5RTtZQUN6RTtZQUNDLGdCQUFnQjtZQUNoQixnQkFBZ0I7WUFDaEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUM7Z0JBQ3pFLGlDQUFpQztnQkFDakMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDbEYsQ0FBQztnQkFDRixJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUNaLENBQUM7WUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUNaLElBQUksRUFBRTtvQkFDTCxLQUFLO29CQUNMLElBQUk7aUJBQ0o7Z0JBQ0QsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxTQUFTO2FBQ2pCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDIn0=
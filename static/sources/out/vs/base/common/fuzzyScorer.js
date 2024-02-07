/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/comparers", "vs/base/common/filters", "vs/base/common/hash", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/strings"], function (require, exports, comparers_1, filters_1, hash_1, path_1, platform_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.pieceToQuery = exports.prepareQuery = exports.compareItemsByFuzzyScore = exports.scoreItemFuzzy = exports.scoreFuzzy2 = exports.scoreFuzzy = void 0;
    const NO_MATCH = 0;
    const NO_SCORE = [NO_MATCH, []];
    // const DEBUG = true;
    // const DEBUG_MATRIX = false;
    function scoreFuzzy(target, query, queryLower, allowNonContiguousMatches) {
        if (!target || !query) {
            return NO_SCORE; // return early if target or query are undefined
        }
        const targetLength = target.length;
        const queryLength = query.length;
        if (targetLength < queryLength) {
            return NO_SCORE; // impossible for query to be contained in target
        }
        // if (DEBUG) {
        // 	console.group(`Target: ${target}, Query: ${query}`);
        // }
        const targetLower = target.toLowerCase();
        const res = doScoreFuzzy(query, queryLower, queryLength, target, targetLower, targetLength, allowNonContiguousMatches);
        // if (DEBUG) {
        // 	console.log(`%cFinal Score: ${res[0]}`, 'font-weight: bold');
        // 	console.groupEnd();
        // }
        return res;
    }
    exports.scoreFuzzy = scoreFuzzy;
    function doScoreFuzzy(query, queryLower, queryLength, target, targetLower, targetLength, allowNonContiguousMatches) {
        const scores = [];
        const matches = [];
        //
        // Build Scorer Matrix:
        //
        // The matrix is composed of query q and target t. For each index we score
        // q[i] with t[i] and compare that with the previous score. If the score is
        // equal or larger, we keep the match. In addition to the score, we also keep
        // the length of the consecutive matches to use as boost for the score.
        //
        //      t   a   r   g   e   t
        //  q
        //  u
        //  e
        //  r
        //  y
        //
        for (let queryIndex = 0; queryIndex < queryLength; queryIndex++) {
            const queryIndexOffset = queryIndex * targetLength;
            const queryIndexPreviousOffset = queryIndexOffset - targetLength;
            const queryIndexGtNull = queryIndex > 0;
            const queryCharAtIndex = query[queryIndex];
            const queryLowerCharAtIndex = queryLower[queryIndex];
            for (let targetIndex = 0; targetIndex < targetLength; targetIndex++) {
                const targetIndexGtNull = targetIndex > 0;
                const currentIndex = queryIndexOffset + targetIndex;
                const leftIndex = currentIndex - 1;
                const diagIndex = queryIndexPreviousOffset + targetIndex - 1;
                const leftScore = targetIndexGtNull ? scores[leftIndex] : 0;
                const diagScore = queryIndexGtNull && targetIndexGtNull ? scores[diagIndex] : 0;
                const matchesSequenceLength = queryIndexGtNull && targetIndexGtNull ? matches[diagIndex] : 0;
                // If we are not matching on the first query character any more, we only produce a
                // score if we had a score previously for the last query index (by looking at the diagScore).
                // This makes sure that the query always matches in sequence on the target. For example
                // given a target of "ede" and a query of "de", we would otherwise produce a wrong high score
                // for query[1] ("e") matching on target[0] ("e") because of the "beginning of word" boost.
                let score;
                if (!diagScore && queryIndexGtNull) {
                    score = 0;
                }
                else {
                    score = computeCharScore(queryCharAtIndex, queryLowerCharAtIndex, target, targetLower, targetIndex, matchesSequenceLength);
                }
                // We have a score and its equal or larger than the left score
                // Match: sequence continues growing from previous diag value
                // Score: increases by diag score value
                const isValidScore = score && diagScore + score >= leftScore;
                if (isValidScore && (
                // We don't need to check if it's contiguous if we allow non-contiguous matches
                allowNonContiguousMatches ||
                    // We must be looking for a contiguous match.
                    // Looking at an index higher than 0 in the query means we must have already
                    // found out this is contiguous otherwise there wouldn't have been a score
                    queryIndexGtNull ||
                    // lastly check if the query is completely contiguous at this index in the target
                    targetLower.startsWith(queryLower, targetIndex))) {
                    matches[currentIndex] = matchesSequenceLength + 1;
                    scores[currentIndex] = diagScore + score;
                }
                // We either have no score or the score is lower than the left score
                // Match: reset to 0
                // Score: pick up from left hand side
                else {
                    matches[currentIndex] = NO_MATCH;
                    scores[currentIndex] = leftScore;
                }
            }
        }
        // Restore Positions (starting from bottom right of matrix)
        const positions = [];
        let queryIndex = queryLength - 1;
        let targetIndex = targetLength - 1;
        while (queryIndex >= 0 && targetIndex >= 0) {
            const currentIndex = queryIndex * targetLength + targetIndex;
            const match = matches[currentIndex];
            if (match === NO_MATCH) {
                targetIndex--; // go left
            }
            else {
                positions.push(targetIndex);
                // go up and left
                queryIndex--;
                targetIndex--;
            }
        }
        // Print matrix
        // if (DEBUG_MATRIX) {
        // 	printMatrix(query, target, matches, scores);
        // }
        return [scores[queryLength * targetLength - 1], positions.reverse()];
    }
    function computeCharScore(queryCharAtIndex, queryLowerCharAtIndex, target, targetLower, targetIndex, matchesSequenceLength) {
        let score = 0;
        if (!considerAsEqual(queryLowerCharAtIndex, targetLower[targetIndex])) {
            return score; // no match of characters
        }
        // if (DEBUG) {
        // 	console.groupCollapsed(`%cFound a match of char: ${queryLowerCharAtIndex} at index ${targetIndex}`, 'font-weight: normal');
        // }
        // Character match bonus
        score += 1;
        // if (DEBUG) {
        // 	console.log(`%cCharacter match bonus: +1`, 'font-weight: normal');
        // }
        // Consecutive match bonus
        if (matchesSequenceLength > 0) {
            score += (matchesSequenceLength * 5);
            // if (DEBUG) {
            // 	console.log(`Consecutive match bonus: +${matchesSequenceLength * 5}`);
            // }
        }
        // Same case bonus
        if (queryCharAtIndex === target[targetIndex]) {
            score += 1;
            // if (DEBUG) {
            // 	console.log('Same case bonus: +1');
            // }
        }
        // Start of word bonus
        if (targetIndex === 0) {
            score += 8;
            // if (DEBUG) {
            // 	console.log('Start of word bonus: +8');
            // }
        }
        else {
            // After separator bonus
            const separatorBonus = scoreSeparatorAtPos(target.charCodeAt(targetIndex - 1));
            if (separatorBonus) {
                score += separatorBonus;
                // if (DEBUG) {
                // 	console.log(`After separator bonus: +${separatorBonus}`);
                // }
            }
            // Inside word upper case bonus (camel case). We only give this bonus if we're not in a contiguous sequence.
            // For example:
            // NPE => NullPointerException = boost
            // HTTP => HTTP = not boost
            else if ((0, filters_1.isUpper)(target.charCodeAt(targetIndex)) && matchesSequenceLength === 0) {
                score += 2;
                // if (DEBUG) {
                // 	console.log('Inside word upper case bonus: +2');
                // }
            }
        }
        // if (DEBUG) {
        // 	console.log(`Total score: ${score}`);
        // 	console.groupEnd();
        // }
        return score;
    }
    function considerAsEqual(a, b) {
        if (a === b) {
            return true;
        }
        // Special case path separators: ignore platform differences
        if (a === '/' || a === '\\') {
            return b === '/' || b === '\\';
        }
        return false;
    }
    function scoreSeparatorAtPos(charCode) {
        switch (charCode) {
            case 47 /* CharCode.Slash */:
            case 92 /* CharCode.Backslash */:
                return 5; // prefer path separators...
            case 95 /* CharCode.Underline */:
            case 45 /* CharCode.Dash */:
            case 46 /* CharCode.Period */:
            case 32 /* CharCode.Space */:
            case 39 /* CharCode.SingleQuote */:
            case 34 /* CharCode.DoubleQuote */:
            case 58 /* CharCode.Colon */:
                return 4; // ...over other separators
            default:
                return 0;
        }
    }
    const NO_SCORE2 = [undefined, []];
    function scoreFuzzy2(target, query, patternStart = 0, wordStart = 0) {
        // Score: multiple inputs
        const preparedQuery = query;
        if (preparedQuery.values && preparedQuery.values.length > 1) {
            return doScoreFuzzy2Multiple(target, preparedQuery.values, patternStart, wordStart);
        }
        // Score: single input
        return doScoreFuzzy2Single(target, query, patternStart, wordStart);
    }
    exports.scoreFuzzy2 = scoreFuzzy2;
    function doScoreFuzzy2Multiple(target, query, patternStart, wordStart) {
        let totalScore = 0;
        const totalMatches = [];
        for (const queryPiece of query) {
            const [score, matches] = doScoreFuzzy2Single(target, queryPiece, patternStart, wordStart);
            if (typeof score !== 'number') {
                // if a single query value does not match, return with
                // no score entirely, we require all queries to match
                return NO_SCORE2;
            }
            totalScore += score;
            totalMatches.push(...matches);
        }
        // if we have a score, ensure that the positions are
        // sorted in ascending order and distinct
        return [totalScore, normalizeMatches(totalMatches)];
    }
    function doScoreFuzzy2Single(target, query, patternStart, wordStart) {
        const score = (0, filters_1.fuzzyScore)(query.original, query.originalLowercase, patternStart, target, target.toLowerCase(), wordStart, { firstMatchCanBeWeak: true, boostFullMatch: true });
        if (!score) {
            return NO_SCORE2;
        }
        return [score[0], (0, filters_1.createMatches)(score)];
    }
    const NO_ITEM_SCORE = Object.freeze({ score: 0 });
    const PATH_IDENTITY_SCORE = 1 << 18;
    const LABEL_PREFIX_SCORE_THRESHOLD = 1 << 17;
    const LABEL_SCORE_THRESHOLD = 1 << 16;
    function getCacheHash(label, description, allowNonContiguousMatches, query) {
        const values = query.values ? query.values : [query];
        const cacheHash = (0, hash_1.hash)({
            [query.normalized]: {
                values: values.map(v => ({ value: v.normalized, expectContiguousMatch: v.expectContiguousMatch })),
                label,
                description,
                allowNonContiguousMatches
            }
        });
        return cacheHash;
    }
    function scoreItemFuzzy(item, query, allowNonContiguousMatches, accessor, cache) {
        if (!item || !query.normalized) {
            return NO_ITEM_SCORE; // we need an item and query to score on at least
        }
        const label = accessor.getItemLabel(item);
        if (!label) {
            return NO_ITEM_SCORE; // we need a label at least
        }
        const description = accessor.getItemDescription(item);
        // in order to speed up scoring, we cache the score with a unique hash based on:
        // - label
        // - description (if provided)
        // - whether non-contiguous matching is enabled or not
        // - hash of the query (normalized) values
        const cacheHash = getCacheHash(label, description, allowNonContiguousMatches, query);
        const cached = cache[cacheHash];
        if (cached) {
            return cached;
        }
        const itemScore = doScoreItemFuzzy(label, description, accessor.getItemPath(item), query, allowNonContiguousMatches);
        cache[cacheHash] = itemScore;
        return itemScore;
    }
    exports.scoreItemFuzzy = scoreItemFuzzy;
    function doScoreItemFuzzy(label, description, path, query, allowNonContiguousMatches) {
        const preferLabelMatches = !path || !query.containsPathSeparator;
        // Treat identity matches on full path highest
        if (path && (platform_1.isLinux ? query.pathNormalized === path : (0, strings_1.equalsIgnoreCase)(query.pathNormalized, path))) {
            return { score: PATH_IDENTITY_SCORE, labelMatch: [{ start: 0, end: label.length }], descriptionMatch: description ? [{ start: 0, end: description.length }] : undefined };
        }
        // Score: multiple inputs
        if (query.values && query.values.length > 1) {
            return doScoreItemFuzzyMultiple(label, description, path, query.values, preferLabelMatches, allowNonContiguousMatches);
        }
        // Score: single input
        return doScoreItemFuzzySingle(label, description, path, query, preferLabelMatches, allowNonContiguousMatches);
    }
    function doScoreItemFuzzyMultiple(label, description, path, query, preferLabelMatches, allowNonContiguousMatches) {
        let totalScore = 0;
        const totalLabelMatches = [];
        const totalDescriptionMatches = [];
        for (const queryPiece of query) {
            const { score, labelMatch, descriptionMatch } = doScoreItemFuzzySingle(label, description, path, queryPiece, preferLabelMatches, allowNonContiguousMatches);
            if (score === NO_MATCH) {
                // if a single query value does not match, return with
                // no score entirely, we require all queries to match
                return NO_ITEM_SCORE;
            }
            totalScore += score;
            if (labelMatch) {
                totalLabelMatches.push(...labelMatch);
            }
            if (descriptionMatch) {
                totalDescriptionMatches.push(...descriptionMatch);
            }
        }
        // if we have a score, ensure that the positions are
        // sorted in ascending order and distinct
        return {
            score: totalScore,
            labelMatch: normalizeMatches(totalLabelMatches),
            descriptionMatch: normalizeMatches(totalDescriptionMatches)
        };
    }
    function doScoreItemFuzzySingle(label, description, path, query, preferLabelMatches, allowNonContiguousMatches) {
        // Prefer label matches if told so or we have no description
        if (preferLabelMatches || !description) {
            const [labelScore, labelPositions] = scoreFuzzy(label, query.normalized, query.normalizedLowercase, allowNonContiguousMatches && !query.expectContiguousMatch);
            if (labelScore) {
                // If we have a prefix match on the label, we give a much
                // higher baseScore to elevate these matches over others
                // This ensures that typing a file name wins over results
                // that are present somewhere in the label, but not the
                // beginning.
                const labelPrefixMatch = (0, filters_1.matchesPrefix)(query.normalized, label);
                let baseScore;
                if (labelPrefixMatch) {
                    baseScore = LABEL_PREFIX_SCORE_THRESHOLD;
                    // We give another boost to labels that are short, e.g. given
                    // files "window.ts" and "windowActions.ts" and a query of
                    // "window", we want "window.ts" to receive a higher score.
                    // As such we compute the percentage the query has within the
                    // label and add that to the baseScore.
                    const prefixLengthBoost = Math.round((query.normalized.length / label.length) * 100);
                    baseScore += prefixLengthBoost;
                }
                else {
                    baseScore = LABEL_SCORE_THRESHOLD;
                }
                return { score: baseScore + labelScore, labelMatch: labelPrefixMatch || createMatches(labelPositions) };
            }
        }
        // Finally compute description + label scores if we have a description
        if (description) {
            let descriptionPrefix = description;
            if (!!path) {
                descriptionPrefix = `${description}${path_1.sep}`; // assume this is a file path
            }
            const descriptionPrefixLength = descriptionPrefix.length;
            const descriptionAndLabel = `${descriptionPrefix}${label}`;
            const [labelDescriptionScore, labelDescriptionPositions] = scoreFuzzy(descriptionAndLabel, query.normalized, query.normalizedLowercase, allowNonContiguousMatches && !query.expectContiguousMatch);
            if (labelDescriptionScore) {
                const labelDescriptionMatches = createMatches(labelDescriptionPositions);
                const labelMatch = [];
                const descriptionMatch = [];
                // We have to split the matches back onto the label and description portions
                labelDescriptionMatches.forEach(h => {
                    // Match overlaps label and description part, we need to split it up
                    if (h.start < descriptionPrefixLength && h.end > descriptionPrefixLength) {
                        labelMatch.push({ start: 0, end: h.end - descriptionPrefixLength });
                        descriptionMatch.push({ start: h.start, end: descriptionPrefixLength });
                    }
                    // Match on label part
                    else if (h.start >= descriptionPrefixLength) {
                        labelMatch.push({ start: h.start - descriptionPrefixLength, end: h.end - descriptionPrefixLength });
                    }
                    // Match on description part
                    else {
                        descriptionMatch.push(h);
                    }
                });
                return { score: labelDescriptionScore, labelMatch, descriptionMatch };
            }
        }
        return NO_ITEM_SCORE;
    }
    function createMatches(offsets) {
        const ret = [];
        if (!offsets) {
            return ret;
        }
        let last;
        for (const pos of offsets) {
            if (last && last.end === pos) {
                last.end += 1;
            }
            else {
                last = { start: pos, end: pos + 1 };
                ret.push(last);
            }
        }
        return ret;
    }
    function normalizeMatches(matches) {
        // sort matches by start to be able to normalize
        const sortedMatches = matches.sort((matchA, matchB) => {
            return matchA.start - matchB.start;
        });
        // merge matches that overlap
        const normalizedMatches = [];
        let currentMatch = undefined;
        for (const match of sortedMatches) {
            // if we have no current match or the matches
            // do not overlap, we take it as is and remember
            // it for future merging
            if (!currentMatch || !matchOverlaps(currentMatch, match)) {
                currentMatch = match;
                normalizedMatches.push(match);
            }
            // otherwise we merge the matches
            else {
                currentMatch.start = Math.min(currentMatch.start, match.start);
                currentMatch.end = Math.max(currentMatch.end, match.end);
            }
        }
        return normalizedMatches;
    }
    function matchOverlaps(matchA, matchB) {
        if (matchA.end < matchB.start) {
            return false; // A ends before B starts
        }
        if (matchB.end < matchA.start) {
            return false; // B ends before A starts
        }
        return true;
    }
    //#endregion
    //#region Comparers
    function compareItemsByFuzzyScore(itemA, itemB, query, allowNonContiguousMatches, accessor, cache) {
        const itemScoreA = scoreItemFuzzy(itemA, query, allowNonContiguousMatches, accessor, cache);
        const itemScoreB = scoreItemFuzzy(itemB, query, allowNonContiguousMatches, accessor, cache);
        const scoreA = itemScoreA.score;
        const scoreB = itemScoreB.score;
        // 1.) identity matches have highest score
        if (scoreA === PATH_IDENTITY_SCORE || scoreB === PATH_IDENTITY_SCORE) {
            if (scoreA !== scoreB) {
                return scoreA === PATH_IDENTITY_SCORE ? -1 : 1;
            }
        }
        // 2.) matches on label are considered higher compared to label+description matches
        if (scoreA > LABEL_SCORE_THRESHOLD || scoreB > LABEL_SCORE_THRESHOLD) {
            if (scoreA !== scoreB) {
                return scoreA > scoreB ? -1 : 1;
            }
            // prefer more compact matches over longer in label (unless this is a prefix match where
            // longer prefix matches are actually preferred)
            if (scoreA < LABEL_PREFIX_SCORE_THRESHOLD && scoreB < LABEL_PREFIX_SCORE_THRESHOLD) {
                const comparedByMatchLength = compareByMatchLength(itemScoreA.labelMatch, itemScoreB.labelMatch);
                if (comparedByMatchLength !== 0) {
                    return comparedByMatchLength;
                }
            }
            // prefer shorter labels over longer labels
            const labelA = accessor.getItemLabel(itemA) || '';
            const labelB = accessor.getItemLabel(itemB) || '';
            if (labelA.length !== labelB.length) {
                return labelA.length - labelB.length;
            }
        }
        // 3.) compare by score in label+description
        if (scoreA !== scoreB) {
            return scoreA > scoreB ? -1 : 1;
        }
        // 4.) scores are identical: prefer matches in label over non-label matches
        const itemAHasLabelMatches = Array.isArray(itemScoreA.labelMatch) && itemScoreA.labelMatch.length > 0;
        const itemBHasLabelMatches = Array.isArray(itemScoreB.labelMatch) && itemScoreB.labelMatch.length > 0;
        if (itemAHasLabelMatches && !itemBHasLabelMatches) {
            return -1;
        }
        else if (itemBHasLabelMatches && !itemAHasLabelMatches) {
            return 1;
        }
        // 5.) scores are identical: prefer more compact matches (label and description)
        const itemAMatchDistance = computeLabelAndDescriptionMatchDistance(itemA, itemScoreA, accessor);
        const itemBMatchDistance = computeLabelAndDescriptionMatchDistance(itemB, itemScoreB, accessor);
        if (itemAMatchDistance && itemBMatchDistance && itemAMatchDistance !== itemBMatchDistance) {
            return itemBMatchDistance > itemAMatchDistance ? -1 : 1;
        }
        // 6.) scores are identical: start to use the fallback compare
        return fallbackCompare(itemA, itemB, query, accessor);
    }
    exports.compareItemsByFuzzyScore = compareItemsByFuzzyScore;
    function computeLabelAndDescriptionMatchDistance(item, score, accessor) {
        let matchStart = -1;
        let matchEnd = -1;
        // If we have description matches, the start is first of description match
        if (score.descriptionMatch && score.descriptionMatch.length) {
            matchStart = score.descriptionMatch[0].start;
        }
        // Otherwise, the start is the first label match
        else if (score.labelMatch && score.labelMatch.length) {
            matchStart = score.labelMatch[0].start;
        }
        // If we have label match, the end is the last label match
        // If we had a description match, we add the length of the description
        // as offset to the end to indicate this.
        if (score.labelMatch && score.labelMatch.length) {
            matchEnd = score.labelMatch[score.labelMatch.length - 1].end;
            if (score.descriptionMatch && score.descriptionMatch.length) {
                const itemDescription = accessor.getItemDescription(item);
                if (itemDescription) {
                    matchEnd += itemDescription.length;
                }
            }
        }
        // If we have just a description match, the end is the last description match
        else if (score.descriptionMatch && score.descriptionMatch.length) {
            matchEnd = score.descriptionMatch[score.descriptionMatch.length - 1].end;
        }
        return matchEnd - matchStart;
    }
    function compareByMatchLength(matchesA, matchesB) {
        if ((!matchesA && !matchesB) || ((!matchesA || !matchesA.length) && (!matchesB || !matchesB.length))) {
            return 0; // make sure to not cause bad comparing when matches are not provided
        }
        if (!matchesB || !matchesB.length) {
            return -1;
        }
        if (!matchesA || !matchesA.length) {
            return 1;
        }
        // Compute match length of A (first to last match)
        const matchStartA = matchesA[0].start;
        const matchEndA = matchesA[matchesA.length - 1].end;
        const matchLengthA = matchEndA - matchStartA;
        // Compute match length of B (first to last match)
        const matchStartB = matchesB[0].start;
        const matchEndB = matchesB[matchesB.length - 1].end;
        const matchLengthB = matchEndB - matchStartB;
        // Prefer shorter match length
        return matchLengthA === matchLengthB ? 0 : matchLengthB < matchLengthA ? 1 : -1;
    }
    function fallbackCompare(itemA, itemB, query, accessor) {
        // check for label + description length and prefer shorter
        const labelA = accessor.getItemLabel(itemA) || '';
        const labelB = accessor.getItemLabel(itemB) || '';
        const descriptionA = accessor.getItemDescription(itemA);
        const descriptionB = accessor.getItemDescription(itemB);
        const labelDescriptionALength = labelA.length + (descriptionA ? descriptionA.length : 0);
        const labelDescriptionBLength = labelB.length + (descriptionB ? descriptionB.length : 0);
        if (labelDescriptionALength !== labelDescriptionBLength) {
            return labelDescriptionALength - labelDescriptionBLength;
        }
        // check for path length and prefer shorter
        const pathA = accessor.getItemPath(itemA);
        const pathB = accessor.getItemPath(itemB);
        if (pathA && pathB && pathA.length !== pathB.length) {
            return pathA.length - pathB.length;
        }
        // 7.) finally we have equal scores and equal length, we fallback to comparer
        // compare by label
        if (labelA !== labelB) {
            return (0, comparers_1.compareAnything)(labelA, labelB, query.normalized);
        }
        // compare by description
        if (descriptionA && descriptionB && descriptionA !== descriptionB) {
            return (0, comparers_1.compareAnything)(descriptionA, descriptionB, query.normalized);
        }
        // compare by path
        if (pathA && pathB && pathA !== pathB) {
            return (0, comparers_1.compareAnything)(pathA, pathB, query.normalized);
        }
        // equal
        return 0;
    }
    /*
     * If a query is wrapped in quotes, the user does not want to
     * use fuzzy search for this query.
     */
    function queryExpectsExactMatch(query) {
        return query.startsWith('"') && query.endsWith('"');
    }
    /**
     * Helper function to prepare a search value for scoring by removing unwanted characters
     * and allowing to score on multiple pieces separated by whitespace character.
     */
    const MULTIPLE_QUERY_VALUES_SEPARATOR = ' ';
    function prepareQuery(original) {
        if (typeof original !== 'string') {
            original = '';
        }
        const originalLowercase = original.toLowerCase();
        const { pathNormalized, normalized, normalizedLowercase } = normalizeQuery(original);
        const containsPathSeparator = pathNormalized.indexOf(path_1.sep) >= 0;
        const expectExactMatch = queryExpectsExactMatch(original);
        let values = undefined;
        const originalSplit = original.split(MULTIPLE_QUERY_VALUES_SEPARATOR);
        if (originalSplit.length > 1) {
            for (const originalPiece of originalSplit) {
                const expectExactMatchPiece = queryExpectsExactMatch(originalPiece);
                const { pathNormalized: pathNormalizedPiece, normalized: normalizedPiece, normalizedLowercase: normalizedLowercasePiece } = normalizeQuery(originalPiece);
                if (normalizedPiece) {
                    if (!values) {
                        values = [];
                    }
                    values.push({
                        original: originalPiece,
                        originalLowercase: originalPiece.toLowerCase(),
                        pathNormalized: pathNormalizedPiece,
                        normalized: normalizedPiece,
                        normalizedLowercase: normalizedLowercasePiece,
                        expectContiguousMatch: expectExactMatchPiece
                    });
                }
            }
        }
        return { original, originalLowercase, pathNormalized, normalized, normalizedLowercase, values, containsPathSeparator, expectContiguousMatch: expectExactMatch };
    }
    exports.prepareQuery = prepareQuery;
    function normalizeQuery(original) {
        let pathNormalized;
        if (platform_1.isWindows) {
            pathNormalized = original.replace(/\//g, path_1.sep); // Help Windows users to search for paths when using slash
        }
        else {
            pathNormalized = original.replace(/\\/g, path_1.sep); // Help macOS/Linux users to search for paths when using backslash
        }
        // we remove quotes here because quotes are used for exact match search
        const normalized = (0, strings_1.stripWildcards)(pathNormalized).replace(/\s|"/g, '');
        return {
            pathNormalized,
            normalized,
            normalizedLowercase: normalized.toLowerCase()
        };
    }
    function pieceToQuery(arg1) {
        if (Array.isArray(arg1)) {
            return prepareQuery(arg1.map(piece => piece.original).join(MULTIPLE_QUERY_VALUES_SEPARATOR));
        }
        return prepareQuery(arg1.original);
    }
    exports.pieceToQuery = pieceToQuery;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnV6enlTY29yZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2Z1enp5U2NvcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRyxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDbkIsTUFBTSxRQUFRLEdBQWUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFNUMsc0JBQXNCO0lBQ3RCLDhCQUE4QjtJQUU5QixTQUFnQixVQUFVLENBQUMsTUFBYyxFQUFFLEtBQWEsRUFBRSxVQUFrQixFQUFFLHlCQUFrQztRQUMvRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDdkIsT0FBTyxRQUFRLENBQUMsQ0FBQyxnREFBZ0Q7UUFDbEUsQ0FBQztRQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDbkMsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUVqQyxJQUFJLFlBQVksR0FBRyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxPQUFPLFFBQVEsQ0FBQyxDQUFDLGlEQUFpRDtRQUNuRSxDQUFDO1FBRUQsZUFBZTtRQUNmLHdEQUF3RDtRQUN4RCxJQUFJO1FBRUosTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1FBRXZILGVBQWU7UUFDZixpRUFBaUU7UUFDakUsdUJBQXVCO1FBQ3ZCLElBQUk7UUFFSixPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUF6QkQsZ0NBeUJDO0lBRUQsU0FBUyxZQUFZLENBQUMsS0FBYSxFQUFFLFVBQWtCLEVBQUUsV0FBbUIsRUFBRSxNQUFjLEVBQUUsV0FBbUIsRUFBRSxZQUFvQixFQUFFLHlCQUFrQztRQUMxSyxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDNUIsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1FBRTdCLEVBQUU7UUFDRix1QkFBdUI7UUFDdkIsRUFBRTtRQUNGLDBFQUEwRTtRQUMxRSwyRUFBMkU7UUFDM0UsNkVBQTZFO1FBQzdFLHVFQUF1RTtRQUN2RSxFQUFFO1FBQ0YsNkJBQTZCO1FBQzdCLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsRUFBRTtRQUNGLEtBQUssSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQztZQUNqRSxNQUFNLGdCQUFnQixHQUFHLFVBQVUsR0FBRyxZQUFZLENBQUM7WUFDbkQsTUFBTSx3QkFBd0IsR0FBRyxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7WUFFakUsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBRXhDLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNDLE1BQU0scUJBQXFCLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRXJELEtBQUssSUFBSSxXQUFXLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxZQUFZLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQztnQkFDckUsTUFBTSxpQkFBaUIsR0FBRyxXQUFXLEdBQUcsQ0FBQyxDQUFDO2dCQUUxQyxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsR0FBRyxXQUFXLENBQUM7Z0JBQ3BELE1BQU0sU0FBUyxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUM7Z0JBQ25DLE1BQU0sU0FBUyxHQUFHLHdCQUF3QixHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBRTdELE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUQsTUFBTSxTQUFTLEdBQUcsZ0JBQWdCLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVoRixNQUFNLHFCQUFxQixHQUFHLGdCQUFnQixJQUFJLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFN0Ysa0ZBQWtGO2dCQUNsRiw2RkFBNkY7Z0JBQzdGLHVGQUF1RjtnQkFDdkYsNkZBQTZGO2dCQUM3RiwyRkFBMkY7Z0JBQzNGLElBQUksS0FBYSxDQUFDO2dCQUNsQixJQUFJLENBQUMsU0FBUyxJQUFJLGdCQUFnQixFQUFFLENBQUM7b0JBQ3BDLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQztxQkFBTSxDQUFDO29CQUNQLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxxQkFBcUIsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO2dCQUM1SCxDQUFDO2dCQUVELDhEQUE4RDtnQkFDOUQsNkRBQTZEO2dCQUM3RCx1Q0FBdUM7Z0JBQ3ZDLE1BQU0sWUFBWSxHQUFHLEtBQUssSUFBSSxTQUFTLEdBQUcsS0FBSyxJQUFJLFNBQVMsQ0FBQztnQkFDN0QsSUFBSSxZQUFZLElBQUk7Z0JBQ25CLCtFQUErRTtnQkFDL0UseUJBQXlCO29CQUN6Qiw2Q0FBNkM7b0JBQzdDLDRFQUE0RTtvQkFDNUUsMEVBQTBFO29CQUMxRSxnQkFBZ0I7b0JBQ2hCLGlGQUFpRjtvQkFDakYsV0FBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQy9DLEVBQUUsQ0FBQztvQkFDSCxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcscUJBQXFCLEdBQUcsQ0FBQyxDQUFDO29CQUNsRCxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUyxHQUFHLEtBQUssQ0FBQztnQkFDMUMsQ0FBQztnQkFFRCxvRUFBb0U7Z0JBQ3BFLG9CQUFvQjtnQkFDcEIscUNBQXFDO3FCQUNoQyxDQUFDO29CQUNMLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxRQUFRLENBQUM7b0JBQ2pDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxTQUFTLENBQUM7Z0JBQ2xDLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELDJEQUEyRDtRQUMzRCxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7UUFDL0IsSUFBSSxVQUFVLEdBQUcsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLFdBQVcsR0FBRyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sVUFBVSxJQUFJLENBQUMsSUFBSSxXQUFXLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDNUMsTUFBTSxZQUFZLEdBQUcsVUFBVSxHQUFHLFlBQVksR0FBRyxXQUFXLENBQUM7WUFDN0QsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3BDLElBQUksS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUN4QixXQUFXLEVBQUUsQ0FBQyxDQUFDLFVBQVU7WUFDMUIsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBRTVCLGlCQUFpQjtnQkFDakIsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsV0FBVyxFQUFFLENBQUM7WUFDZixDQUFDO1FBQ0YsQ0FBQztRQUVELGVBQWU7UUFDZixzQkFBc0I7UUFDdEIsZ0RBQWdEO1FBQ2hELElBQUk7UUFFSixPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVELFNBQVMsZ0JBQWdCLENBQUMsZ0JBQXdCLEVBQUUscUJBQTZCLEVBQUUsTUFBYyxFQUFFLFdBQW1CLEVBQUUsV0FBbUIsRUFBRSxxQkFBNkI7UUFDekssSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRWQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxxQkFBcUIsRUFBRSxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3ZFLE9BQU8sS0FBSyxDQUFDLENBQUMseUJBQXlCO1FBQ3hDLENBQUM7UUFFRCxlQUFlO1FBQ2YsK0hBQStIO1FBQy9ILElBQUk7UUFFSix3QkFBd0I7UUFDeEIsS0FBSyxJQUFJLENBQUMsQ0FBQztRQUVYLGVBQWU7UUFDZixzRUFBc0U7UUFDdEUsSUFBSTtRQUVKLDBCQUEwQjtRQUMxQixJQUFJLHFCQUFxQixHQUFHLENBQUMsRUFBRSxDQUFDO1lBQy9CLEtBQUssSUFBSSxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXJDLGVBQWU7WUFDZiwwRUFBMEU7WUFDMUUsSUFBSTtRQUNMLENBQUM7UUFFRCxrQkFBa0I7UUFDbEIsSUFBSSxnQkFBZ0IsS0FBSyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUM5QyxLQUFLLElBQUksQ0FBQyxDQUFDO1lBRVgsZUFBZTtZQUNmLHVDQUF1QztZQUN2QyxJQUFJO1FBQ0wsQ0FBQztRQUVELHNCQUFzQjtRQUN0QixJQUFJLFdBQVcsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN2QixLQUFLLElBQUksQ0FBQyxDQUFDO1lBRVgsZUFBZTtZQUNmLDJDQUEyQztZQUMzQyxJQUFJO1FBQ0wsQ0FBQzthQUVJLENBQUM7WUFFTCx3QkFBd0I7WUFDeEIsTUFBTSxjQUFjLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRSxJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUNwQixLQUFLLElBQUksY0FBYyxDQUFDO2dCQUV4QixlQUFlO2dCQUNmLDZEQUE2RDtnQkFDN0QsSUFBSTtZQUNMLENBQUM7WUFFRCw0R0FBNEc7WUFDNUcsZUFBZTtZQUNmLHNDQUFzQztZQUN0QywyQkFBMkI7aUJBQ3RCLElBQUksSUFBQSxpQkFBTyxFQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxxQkFBcUIsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDakYsS0FBSyxJQUFJLENBQUMsQ0FBQztnQkFFWCxlQUFlO2dCQUNmLG9EQUFvRDtnQkFDcEQsSUFBSTtZQUNMLENBQUM7UUFDRixDQUFDO1FBRUQsZUFBZTtRQUNmLHlDQUF5QztRQUN6Qyx1QkFBdUI7UUFDdkIsSUFBSTtRQUVKLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVMsZUFBZSxDQUFDLENBQVMsRUFBRSxDQUFTO1FBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ2IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsNERBQTREO1FBQzVELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDN0IsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUM7UUFDaEMsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVMsbUJBQW1CLENBQUMsUUFBZ0I7UUFDNUMsUUFBUSxRQUFRLEVBQUUsQ0FBQztZQUNsQiw2QkFBb0I7WUFDcEI7Z0JBQ0MsT0FBTyxDQUFDLENBQUMsQ0FBQyw0QkFBNEI7WUFDdkMsaUNBQXdCO1lBQ3hCLDRCQUFtQjtZQUNuQiw4QkFBcUI7WUFDckIsNkJBQW9CO1lBQ3BCLG1DQUEwQjtZQUMxQixtQ0FBMEI7WUFDMUI7Z0JBQ0MsT0FBTyxDQUFDLENBQUMsQ0FBQywyQkFBMkI7WUFDdEM7Z0JBQ0MsT0FBTyxDQUFDLENBQUM7UUFDWCxDQUFDO0lBQ0YsQ0FBQztJQXNCRCxNQUFNLFNBQVMsR0FBZ0IsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFL0MsU0FBZ0IsV0FBVyxDQUFDLE1BQWMsRUFBRSxLQUEyQyxFQUFFLFlBQVksR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUM7UUFFdkgseUJBQXlCO1FBQ3pCLE1BQU0sYUFBYSxHQUFHLEtBQXVCLENBQUM7UUFDOUMsSUFBSSxhQUFhLENBQUMsTUFBTSxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzdELE9BQU8scUJBQXFCLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7UUFFRCxzQkFBc0I7UUFDdEIsT0FBTyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBVkQsa0NBVUM7SUFFRCxTQUFTLHFCQUFxQixDQUFDLE1BQWMsRUFBRSxLQUE0QixFQUFFLFlBQW9CLEVBQUUsU0FBaUI7UUFDbkgsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztRQUVsQyxLQUFLLE1BQU0sVUFBVSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDMUYsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDL0Isc0RBQXNEO2dCQUN0RCxxREFBcUQ7Z0JBQ3JELE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7WUFFRCxVQUFVLElBQUksS0FBSyxDQUFDO1lBQ3BCLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRUQsb0RBQW9EO1FBQ3BELHlDQUF5QztRQUN6QyxPQUFPLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELFNBQVMsbUJBQW1CLENBQUMsTUFBYyxFQUFFLEtBQTBCLEVBQUUsWUFBb0IsRUFBRSxTQUFpQjtRQUMvRyxNQUFNLEtBQUssR0FBRyxJQUFBLG9CQUFVLEVBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzlLLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNaLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUEsdUJBQWtCLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBNEJELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQWEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQW9COUQsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BDLE1BQU0sNEJBQTRCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM3QyxNQUFNLHFCQUFxQixHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFdEMsU0FBUyxZQUFZLENBQUMsS0FBYSxFQUFFLFdBQStCLEVBQUUseUJBQWtDLEVBQUUsS0FBcUI7UUFDOUgsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyRCxNQUFNLFNBQVMsR0FBRyxJQUFBLFdBQUksRUFBQztZQUN0QixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDbkIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztnQkFDbEcsS0FBSztnQkFDTCxXQUFXO2dCQUNYLHlCQUF5QjthQUN6QjtTQUNELENBQUMsQ0FBQztRQUNILE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxTQUFnQixjQUFjLENBQUksSUFBTyxFQUFFLEtBQXFCLEVBQUUseUJBQWtDLEVBQUUsUUFBMEIsRUFBRSxLQUF1QjtRQUN4SixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2hDLE9BQU8sYUFBYSxDQUFDLENBQUMsaURBQWlEO1FBQ3hFLENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNaLE9BQU8sYUFBYSxDQUFDLENBQUMsMkJBQTJCO1FBQ2xELENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEQsZ0ZBQWdGO1FBQ2hGLFVBQVU7UUFDViw4QkFBOEI7UUFDOUIsc0RBQXNEO1FBQ3RELDBDQUEwQztRQUMxQyxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSx5QkFBeUIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEMsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNaLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUseUJBQXlCLENBQUMsQ0FBQztRQUNySCxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDO1FBRTdCLE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUEzQkQsd0NBMkJDO0lBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFhLEVBQUUsV0FBK0IsRUFBRSxJQUF3QixFQUFFLEtBQXFCLEVBQUUseUJBQWtDO1FBQzVKLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUM7UUFFakUsOENBQThDO1FBQzlDLElBQUksSUFBSSxJQUFJLENBQUMsa0JBQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUEsMEJBQWdCLEVBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDdEcsT0FBTyxFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzSyxDQUFDO1FBRUQseUJBQXlCO1FBQ3pCLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUM3QyxPQUFPLHdCQUF3QixDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLEVBQUUseUJBQXlCLENBQUMsQ0FBQztRQUN4SCxDQUFDO1FBRUQsc0JBQXNCO1FBQ3RCLE9BQU8sc0JBQXNCLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLHlCQUF5QixDQUFDLENBQUM7SUFDL0csQ0FBQztJQUVELFNBQVMsd0JBQXdCLENBQUMsS0FBYSxFQUFFLFdBQStCLEVBQUUsSUFBd0IsRUFBRSxLQUE0QixFQUFFLGtCQUEyQixFQUFFLHlCQUFrQztRQUN4TSxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsTUFBTSxpQkFBaUIsR0FBYSxFQUFFLENBQUM7UUFDdkMsTUFBTSx1QkFBdUIsR0FBYSxFQUFFLENBQUM7UUFFN0MsS0FBSyxNQUFNLFVBQVUsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNoQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLHNCQUFzQixDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1lBQzVKLElBQUksS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUN4QixzREFBc0Q7Z0JBQ3RELHFEQUFxRDtnQkFDckQsT0FBTyxhQUFhLENBQUM7WUFDdEIsQ0FBQztZQUVELFVBQVUsSUFBSSxLQUFLLENBQUM7WUFDcEIsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDaEIsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7WUFDdkMsQ0FBQztZQUVELElBQUksZ0JBQWdCLEVBQUUsQ0FBQztnQkFDdEIsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQztZQUNuRCxDQUFDO1FBQ0YsQ0FBQztRQUVELG9EQUFvRDtRQUNwRCx5Q0FBeUM7UUFDekMsT0FBTztZQUNOLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQztZQUMvQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQztTQUMzRCxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVMsc0JBQXNCLENBQUMsS0FBYSxFQUFFLFdBQStCLEVBQUUsSUFBd0IsRUFBRSxLQUEwQixFQUFFLGtCQUEyQixFQUFFLHlCQUFrQztRQUVwTSw0REFBNEQ7UUFDNUQsSUFBSSxrQkFBa0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLEdBQUcsVUFBVSxDQUM5QyxLQUFLLEVBQ0wsS0FBSyxDQUFDLFVBQVUsRUFDaEIsS0FBSyxDQUFDLG1CQUFtQixFQUN6Qix5QkFBeUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQzVELElBQUksVUFBVSxFQUFFLENBQUM7Z0JBRWhCLHlEQUF5RDtnQkFDekQsd0RBQXdEO2dCQUN4RCx5REFBeUQ7Z0JBQ3pELHVEQUF1RDtnQkFDdkQsYUFBYTtnQkFDYixNQUFNLGdCQUFnQixHQUFHLElBQUEsdUJBQWEsRUFBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNoRSxJQUFJLFNBQWlCLENBQUM7Z0JBQ3RCLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztvQkFDdEIsU0FBUyxHQUFHLDRCQUE0QixDQUFDO29CQUV6Qyw2REFBNkQ7b0JBQzdELDBEQUEwRDtvQkFDMUQsMkRBQTJEO29CQUMzRCw2REFBNkQ7b0JBQzdELHVDQUF1QztvQkFDdkMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO29CQUNyRixTQUFTLElBQUksaUJBQWlCLENBQUM7Z0JBQ2hDLENBQUM7cUJBQU0sQ0FBQztvQkFDUCxTQUFTLEdBQUcscUJBQXFCLENBQUM7Z0JBQ25DLENBQUM7Z0JBRUQsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEdBQUcsVUFBVSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsSUFBSSxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUN6RyxDQUFDO1FBQ0YsQ0FBQztRQUVELHNFQUFzRTtRQUN0RSxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2pCLElBQUksaUJBQWlCLEdBQUcsV0FBVyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNaLGlCQUFpQixHQUFHLEdBQUcsV0FBVyxHQUFHLFVBQUcsRUFBRSxDQUFDLENBQUMsNkJBQTZCO1lBQzFFLENBQUM7WUFFRCxNQUFNLHVCQUF1QixHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQztZQUN6RCxNQUFNLG1CQUFtQixHQUFHLEdBQUcsaUJBQWlCLEdBQUcsS0FBSyxFQUFFLENBQUM7WUFFM0QsTUFBTSxDQUFDLHFCQUFxQixFQUFFLHlCQUF5QixDQUFDLEdBQUcsVUFBVSxDQUNwRSxtQkFBbUIsRUFDbkIsS0FBSyxDQUFDLFVBQVUsRUFDaEIsS0FBSyxDQUFDLG1CQUFtQixFQUN6Qix5QkFBeUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQzVELElBQUkscUJBQXFCLEVBQUUsQ0FBQztnQkFDM0IsTUFBTSx1QkFBdUIsR0FBRyxhQUFhLENBQUMseUJBQXlCLENBQUMsQ0FBQztnQkFDekUsTUFBTSxVQUFVLEdBQWEsRUFBRSxDQUFDO2dCQUNoQyxNQUFNLGdCQUFnQixHQUFhLEVBQUUsQ0FBQztnQkFFdEMsNEVBQTRFO2dCQUM1RSx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBRW5DLG9FQUFvRTtvQkFDcEUsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLHVCQUF1QixJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsdUJBQXVCLEVBQUUsQ0FBQzt3QkFDMUUsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO3dCQUNwRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDO29CQUN6RSxDQUFDO29CQUVELHNCQUFzQjt5QkFDakIsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLHVCQUF1QixFQUFFLENBQUM7d0JBQzdDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyx1QkFBdUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyx1QkFBdUIsRUFBRSxDQUFDLENBQUM7b0JBQ3JHLENBQUM7b0JBRUQsNEJBQTRCO3lCQUN2QixDQUFDO3dCQUNMLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUIsQ0FBQztnQkFDRixDQUFDLENBQUMsQ0FBQztnQkFFSCxPQUFPLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3ZFLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxhQUFhLENBQUM7SUFDdEIsQ0FBQztJQUVELFNBQVMsYUFBYSxDQUFDLE9BQTZCO1FBQ25ELE1BQU0sR0FBRyxHQUFhLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFFRCxJQUFJLElBQXdCLENBQUM7UUFDN0IsS0FBSyxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUMzQixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUM5QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEIsQ0FBQztRQUNGLENBQUM7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFDLE9BQWlCO1FBRTFDLGdEQUFnRDtRQUNoRCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JELE9BQU8sTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBRUgsNkJBQTZCO1FBQzdCLE1BQU0saUJBQWlCLEdBQWEsRUFBRSxDQUFDO1FBQ3ZDLElBQUksWUFBWSxHQUF1QixTQUFTLENBQUM7UUFDakQsS0FBSyxNQUFNLEtBQUssSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUVuQyw2Q0FBNkM7WUFDN0MsZ0RBQWdEO1lBQ2hELHdCQUF3QjtZQUN4QixJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUMxRCxZQUFZLEdBQUcsS0FBSyxDQUFDO2dCQUNyQixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0IsQ0FBQztZQUVELGlDQUFpQztpQkFDNUIsQ0FBQztnQkFDTCxZQUFZLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9ELFlBQVksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxRCxDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8saUJBQWlCLENBQUM7SUFDMUIsQ0FBQztJQUVELFNBQVMsYUFBYSxDQUFDLE1BQWMsRUFBRSxNQUFjO1FBQ3BELElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDL0IsT0FBTyxLQUFLLENBQUMsQ0FBQyx5QkFBeUI7UUFDeEMsQ0FBQztRQUVELElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDL0IsT0FBTyxLQUFLLENBQUMsQ0FBQyx5QkFBeUI7UUFDeEMsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELFlBQVk7SUFHWixtQkFBbUI7SUFFbkIsU0FBZ0Isd0JBQXdCLENBQUksS0FBUSxFQUFFLEtBQVEsRUFBRSxLQUFxQixFQUFFLHlCQUFrQyxFQUFFLFFBQTBCLEVBQUUsS0FBdUI7UUFDN0ssTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUseUJBQXlCLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVGLE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLHlCQUF5QixFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU1RixNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBQ2hDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFFaEMsMENBQTBDO1FBQzFDLElBQUksTUFBTSxLQUFLLG1CQUFtQixJQUFJLE1BQU0sS0FBSyxtQkFBbUIsRUFBRSxDQUFDO1lBQ3RFLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUN2QixPQUFPLE1BQU0sS0FBSyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRCxDQUFDO1FBQ0YsQ0FBQztRQUVELG1GQUFtRjtRQUNuRixJQUFJLE1BQU0sR0FBRyxxQkFBcUIsSUFBSSxNQUFNLEdBQUcscUJBQXFCLEVBQUUsQ0FBQztZQUN0RSxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUUsQ0FBQztnQkFDdkIsT0FBTyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFFRCx3RkFBd0Y7WUFDeEYsZ0RBQWdEO1lBQ2hELElBQUksTUFBTSxHQUFHLDRCQUE0QixJQUFJLE1BQU0sR0FBRyw0QkFBNEIsRUFBRSxDQUFDO2dCQUNwRixNQUFNLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNqRyxJQUFJLHFCQUFxQixLQUFLLENBQUMsRUFBRSxDQUFDO29CQUNqQyxPQUFPLHFCQUFxQixDQUFDO2dCQUM5QixDQUFDO1lBQ0YsQ0FBQztZQUVELDJDQUEyQztZQUMzQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNsRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNsRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNyQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUN0QyxDQUFDO1FBQ0YsQ0FBQztRQUVELDRDQUE0QztRQUM1QyxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUN2QixPQUFPLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELDJFQUEyRTtRQUMzRSxNQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN0RyxNQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN0RyxJQUFJLG9CQUFvQixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNuRCxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQzthQUFNLElBQUksb0JBQW9CLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzFELE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztRQUVELGdGQUFnRjtRQUNoRixNQUFNLGtCQUFrQixHQUFHLHVDQUF1QyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDaEcsTUFBTSxrQkFBa0IsR0FBRyx1Q0FBdUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2hHLElBQUksa0JBQWtCLElBQUksa0JBQWtCLElBQUksa0JBQWtCLEtBQUssa0JBQWtCLEVBQUUsQ0FBQztZQUMzRixPQUFPLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCw4REFBOEQ7UUFDOUQsT0FBTyxlQUFlLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQTVERCw0REE0REM7SUFFRCxTQUFTLHVDQUF1QyxDQUFJLElBQU8sRUFBRSxLQUFpQixFQUFFLFFBQTBCO1FBQ3pHLElBQUksVUFBVSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksUUFBUSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRTFCLDBFQUEwRTtRQUMxRSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0QsVUFBVSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDOUMsQ0FBQztRQUVELGdEQUFnRDthQUMzQyxJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN0RCxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDeEMsQ0FBQztRQUVELDBEQUEwRDtRQUMxRCxzRUFBc0U7UUFDdEUseUNBQXlDO1FBQ3pDLElBQUksS0FBSyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2pELFFBQVEsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUM3RCxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzdELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxlQUFlLEVBQUUsQ0FBQztvQkFDckIsUUFBUSxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUM7Z0JBQ3BDLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELDZFQUE2RTthQUN4RSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEUsUUFBUSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUMxRSxDQUFDO1FBRUQsT0FBTyxRQUFRLEdBQUcsVUFBVSxDQUFDO0lBQzlCLENBQUM7SUFFRCxTQUFTLG9CQUFvQixDQUFDLFFBQW1CLEVBQUUsUUFBbUI7UUFDckUsSUFBSSxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3RHLE9BQU8sQ0FBQyxDQUFDLENBQUMscUVBQXFFO1FBQ2hGLENBQUM7UUFFRCxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO1FBRUQsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuQyxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFFRCxrREFBa0Q7UUFDbEQsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN0QyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDcEQsTUFBTSxZQUFZLEdBQUcsU0FBUyxHQUFHLFdBQVcsQ0FBQztRQUU3QyxrREFBa0Q7UUFDbEQsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN0QyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDcEQsTUFBTSxZQUFZLEdBQUcsU0FBUyxHQUFHLFdBQVcsQ0FBQztRQUU3Qyw4QkFBOEI7UUFDOUIsT0FBTyxZQUFZLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELFNBQVMsZUFBZSxDQUFJLEtBQVEsRUFBRSxLQUFRLEVBQUUsS0FBcUIsRUFBRSxRQUEwQjtRQUVoRywwREFBMEQ7UUFDMUQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFbEQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV4RCxNQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFekYsSUFBSSx1QkFBdUIsS0FBSyx1QkFBdUIsRUFBRSxDQUFDO1lBQ3pELE9BQU8sdUJBQXVCLEdBQUcsdUJBQXVCLENBQUM7UUFDMUQsQ0FBQztRQUVELDJDQUEyQztRQUMzQyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFMUMsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3JELE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3BDLENBQUM7UUFFRCw2RUFBNkU7UUFFN0UsbUJBQW1CO1FBQ25CLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3ZCLE9BQU8sSUFBQSwyQkFBZSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCx5QkFBeUI7UUFDekIsSUFBSSxZQUFZLElBQUksWUFBWSxJQUFJLFlBQVksS0FBSyxZQUFZLEVBQUUsQ0FBQztZQUNuRSxPQUFPLElBQUEsMkJBQWUsRUFBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRUQsa0JBQWtCO1FBQ2xCLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDdkMsT0FBTyxJQUFBLDJCQUFlLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELFFBQVE7UUFDUixPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFrREQ7OztPQUdHO0lBQ0gsU0FBUyxzQkFBc0IsQ0FBQyxLQUFhO1FBQzVDLE9BQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLCtCQUErQixHQUFHLEdBQUcsQ0FBQztJQUM1QyxTQUFnQixZQUFZLENBQUMsUUFBZ0I7UUFDNUMsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNsQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVELE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pELE1BQU0sRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JGLE1BQU0scUJBQXFCLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0QsTUFBTSxnQkFBZ0IsR0FBRyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUxRCxJQUFJLE1BQU0sR0FBc0MsU0FBUyxDQUFDO1FBRTFELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUN0RSxJQUFJLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDOUIsS0FBSyxNQUFNLGFBQWEsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDM0MsTUFBTSxxQkFBcUIsR0FBRyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDcEUsTUFBTSxFQUNMLGNBQWMsRUFBRSxtQkFBbUIsRUFDbkMsVUFBVSxFQUFFLGVBQWUsRUFDM0IsbUJBQW1CLEVBQUUsd0JBQXdCLEVBQzdDLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUVsQyxJQUFJLGVBQWUsRUFBRSxDQUFDO29CQUNyQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ2IsTUFBTSxHQUFHLEVBQUUsQ0FBQztvQkFDYixDQUFDO29CQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7d0JBQ1gsUUFBUSxFQUFFLGFBQWE7d0JBQ3ZCLGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxXQUFXLEVBQUU7d0JBQzlDLGNBQWMsRUFBRSxtQkFBbUI7d0JBQ25DLFVBQVUsRUFBRSxlQUFlO3dCQUMzQixtQkFBbUIsRUFBRSx3QkFBd0I7d0JBQzdDLHFCQUFxQixFQUFFLHFCQUFxQjtxQkFDNUMsQ0FBQyxDQUFDO2dCQUNKLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELE9BQU8sRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLEVBQUUscUJBQXFCLEVBQUUscUJBQXFCLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztJQUNqSyxDQUFDO0lBeENELG9DQXdDQztJQUVELFNBQVMsY0FBYyxDQUFDLFFBQWdCO1FBQ3ZDLElBQUksY0FBc0IsQ0FBQztRQUMzQixJQUFJLG9CQUFTLEVBQUUsQ0FBQztZQUNmLGNBQWMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFHLENBQUMsQ0FBQyxDQUFDLDBEQUEwRDtRQUMxRyxDQUFDO2FBQU0sQ0FBQztZQUNQLGNBQWMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFHLENBQUMsQ0FBQyxDQUFDLGtFQUFrRTtRQUNsSCxDQUFDO1FBRUQsdUVBQXVFO1FBQ3ZFLE1BQU0sVUFBVSxHQUFHLElBQUEsd0JBQWMsRUFBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXZFLE9BQU87WUFDTixjQUFjO1lBQ2QsVUFBVTtZQUNWLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxXQUFXLEVBQUU7U0FDN0MsQ0FBQztJQUNILENBQUM7SUFJRCxTQUFnQixZQUFZLENBQUMsSUFBaUQ7UUFDN0UsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDekIsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFRCxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQU5ELG9DQU1DOztBQUVELFlBQVkifQ==
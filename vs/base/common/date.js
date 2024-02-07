(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toLocalISOString = exports.fromNow = void 0;
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;
    /**
     * Create a localized difference of the time between now and the specified date.
     * @param date The date to generate the difference from.
     * @param appendAgoLabel Whether to append the " ago" to the end.
     * @param useFullTimeWords Whether to use full words (eg. seconds) instead of
     * shortened (eg. secs).
     * @param disallowNow Whether to disallow the string "now" when the difference
     * is less than 30 seconds.
     */
    function fromNow(date, appendAgoLabel, useFullTimeWords, disallowNow) {
        if (typeof date !== 'number') {
            date = date.getTime();
        }
        const seconds = Math.round((new Date().getTime() - date) / 1000);
        if (seconds < -30) {
            return (0, nls_1.localize)('date.fromNow.in', 'in {0}', fromNow(new Date().getTime() + seconds * 1000, false));
        }
        if (!disallowNow && seconds < 30) {
            return (0, nls_1.localize)('date.fromNow.now', 'now');
        }
        let value;
        if (seconds < minute) {
            value = seconds;
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.seconds.singular.ago.fullWord', '{0} second ago', value)
                        : (0, nls_1.localize)('date.fromNow.seconds.singular.ago', '{0} sec ago', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.seconds.plural.ago.fullWord', '{0} seconds ago', value)
                        : (0, nls_1.localize)('date.fromNow.seconds.plural.ago', '{0} secs ago', value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.seconds.singular.fullWord', '{0} second', value)
                        : (0, nls_1.localize)('date.fromNow.seconds.singular', '{0} sec', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.seconds.plural.fullWord', '{0} seconds', value)
                        : (0, nls_1.localize)('date.fromNow.seconds.plural', '{0} secs', value);
                }
            }
        }
        if (seconds < hour) {
            value = Math.floor(seconds / minute);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.minutes.singular.ago.fullWord', '{0} minute ago', value)
                        : (0, nls_1.localize)('date.fromNow.minutes.singular.ago', '{0} min ago', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.minutes.plural.ago.fullWord', '{0} minutes ago', value)
                        : (0, nls_1.localize)('date.fromNow.minutes.plural.ago', '{0} mins ago', value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.minutes.singular.fullWord', '{0} minute', value)
                        : (0, nls_1.localize)('date.fromNow.minutes.singular', '{0} min', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.minutes.plural.fullWord', '{0} minutes', value)
                        : (0, nls_1.localize)('date.fromNow.minutes.plural', '{0} mins', value);
                }
            }
        }
        if (seconds < day) {
            value = Math.floor(seconds / hour);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.hours.singular.ago.fullWord', '{0} hour ago', value)
                        : (0, nls_1.localize)('date.fromNow.hours.singular.ago', '{0} hr ago', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.hours.plural.ago.fullWord', '{0} hours ago', value)
                        : (0, nls_1.localize)('date.fromNow.hours.plural.ago', '{0} hrs ago', value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.hours.singular.fullWord', '{0} hour', value)
                        : (0, nls_1.localize)('date.fromNow.hours.singular', '{0} hr', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.hours.plural.fullWord', '{0} hours', value)
                        : (0, nls_1.localize)('date.fromNow.hours.plural', '{0} hrs', value);
                }
            }
        }
        if (seconds < week) {
            value = Math.floor(seconds / day);
            if (appendAgoLabel) {
                return value === 1
                    ? (0, nls_1.localize)('date.fromNow.days.singular.ago', '{0} day ago', value)
                    : (0, nls_1.localize)('date.fromNow.days.plural.ago', '{0} days ago', value);
            }
            else {
                return value === 1
                    ? (0, nls_1.localize)('date.fromNow.days.singular', '{0} day', value)
                    : (0, nls_1.localize)('date.fromNow.days.plural', '{0} days', value);
            }
        }
        if (seconds < month) {
            value = Math.floor(seconds / week);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.weeks.singular.ago.fullWord', '{0} week ago', value)
                        : (0, nls_1.localize)('date.fromNow.weeks.singular.ago', '{0} wk ago', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.weeks.plural.ago.fullWord', '{0} weeks ago', value)
                        : (0, nls_1.localize)('date.fromNow.weeks.plural.ago', '{0} wks ago', value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.weeks.singular.fullWord', '{0} week', value)
                        : (0, nls_1.localize)('date.fromNow.weeks.singular', '{0} wk', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.weeks.plural.fullWord', '{0} weeks', value)
                        : (0, nls_1.localize)('date.fromNow.weeks.plural', '{0} wks', value);
                }
            }
        }
        if (seconds < year) {
            value = Math.floor(seconds / month);
            if (appendAgoLabel) {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.months.singular.ago.fullWord', '{0} month ago', value)
                        : (0, nls_1.localize)('date.fromNow.months.singular.ago', '{0} mo ago', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.months.plural.ago.fullWord', '{0} months ago', value)
                        : (0, nls_1.localize)('date.fromNow.months.plural.ago', '{0} mos ago', value);
                }
            }
            else {
                if (value === 1) {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.months.singular.fullWord', '{0} month', value)
                        : (0, nls_1.localize)('date.fromNow.months.singular', '{0} mo', value);
                }
                else {
                    return useFullTimeWords
                        ? (0, nls_1.localize)('date.fromNow.months.plural.fullWord', '{0} months', value)
                        : (0, nls_1.localize)('date.fromNow.months.plural', '{0} mos', value);
                }
            }
        }
        value = Math.floor(seconds / year);
        if (appendAgoLabel) {
            if (value === 1) {
                return useFullTimeWords
                    ? (0, nls_1.localize)('date.fromNow.years.singular.ago.fullWord', '{0} year ago', value)
                    : (0, nls_1.localize)('date.fromNow.years.singular.ago', '{0} yr ago', value);
            }
            else {
                return useFullTimeWords
                    ? (0, nls_1.localize)('date.fromNow.years.plural.ago.fullWord', '{0} years ago', value)
                    : (0, nls_1.localize)('date.fromNow.years.plural.ago', '{0} yrs ago', value);
            }
        }
        else {
            if (value === 1) {
                return useFullTimeWords
                    ? (0, nls_1.localize)('date.fromNow.years.singular.fullWord', '{0} year', value)
                    : (0, nls_1.localize)('date.fromNow.years.singular', '{0} yr', value);
            }
            else {
                return useFullTimeWords
                    ? (0, nls_1.localize)('date.fromNow.years.plural.fullWord', '{0} years', value)
                    : (0, nls_1.localize)('date.fromNow.years.plural', '{0} yrs', value);
            }
        }
    }
    exports.fromNow = fromNow;
    function toLocalISOString(date) {
        return date.getFullYear() +
            '-' + String(date.getMonth() + 1).padStart(2, '0') +
            '-' + String(date.getDate()).padStart(2, '0') +
            'T' + String(date.getHours()).padStart(2, '0') +
            ':' + String(date.getMinutes()).padStart(2, '0') +
            ':' + String(date.getSeconds()).padStart(2, '0') +
            '.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
            'Z';
    }
    exports.toLocalISOString = toLocalISOString;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLE1BQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUN0QixNQUFNLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDdkIsTUFBTSxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUV2Qjs7Ozs7Ozs7T0FRRztJQUNILFNBQWdCLE9BQU8sQ0FBQyxJQUFtQixFQUFFLGNBQXdCLEVBQUUsZ0JBQTBCLEVBQUUsV0FBcUI7UUFDdkgsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM5QixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqRSxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ25CLE9BQU8sSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLE9BQU8sR0FBRyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNyRyxDQUFDO1FBRUQsSUFBSSxDQUFDLFdBQVcsSUFBSSxPQUFPLEdB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
//# sourceURL=../../../vs/base/common/date.js
})
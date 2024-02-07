/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/iterator", "vs/base/common/uuid"], function (require, exports, arrays_1, iterator_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UriList = exports.matchesMimeType = exports.VSDataTransfer = exports.createFileDataTransferItem = exports.createStringDataTransferItem = void 0;
    function createStringDataTransferItem(stringOrPromise) {
        return {
            asString: async () => stringOrPromise,
            asFile: () => undefined,
            value: typeof stringOrPromise === 'string' ? stringOrPromise : undefined,
        };
    }
    exports.createStringDataTransferItem = createStringDataTransferItem;
    function createFileDataTransferItem(fileName, uri, data) {
        const file = { id: (0, uuid_1.generateUuid)(), name: fileName, uri, data };
        return {
            asString: async () => '',
            asFile: () => file,
            value: undefined,
        };
    }
    exports.createFileDataTransferItem = createFileDataTransferItem;
    class VSDataTransfer {
        constructor() {
            this._entries = new Map();
        }
        get size() {
            let size = 0;
            for (const _ of this._entries) {
                size++;
            }
            return size;
        }
        has(mimeType) {
            return this._entries.has(this.toKey(mimeType));
        }
        matches(pattern) {
            const mimes = [...this._entries.keys()];
            if (iterator_1.Iterable.some(this, ([_, item]) => item.asFile())) {
                mimes.push('files');
            }
            return matchesMimeType_normalized(normalizeMimeType(pattern), mimes);
        }
        get(mimeType) {
            return this._entries.get(this.toKey(mimeType))?.[0];
        }
        /**
         * Add a new entry to this data transfer.
         *
         * This does not replace existing entries for `mimeType`.
         */
        append(mimeType, value) {
            const existing = this._entries.get(mimeType);
            if (existing) {
                existing.push(value);
            }
            else {
                this._entries.set(this.toKey(mimeType), [value]);
            }
        }
        /**
         * Set the entry for a given mime type.
         *
         * This replaces all existing entries for `mimeType`.
         */
        replace(mimeType, value) {
            this._entries.set(this.toKey(mimeType), [value]);
        }
        /**
         * Remove all entries for `mimeType`.
         */
        delete(mimeType) {
            this._entries.delete(this.toKey(mimeType));
        }
        /**
         * Iterate over all `[mime, item]` pairs in this data transfer.
         *
         * There may be multiple entries for each mime type.
         */
        *[Symbol.iterator]() {
            for (const [mine, items] of this._entries) {
                for (const item of items) {
                    yield [mine, item];
                }
            }
        }
        toKey(mimeType) {
            return normalizeMimeType(mimeType);
        }
    }
    exports.VSDataTransfer = VSDataTransfer;
    function normalizeMimeType(mimeType) {
        return mimeType.toLowerCase();
    }
    function matchesMimeType(pattern, mimeTypes) {
        return matchesMimeType_normalized(normalizeMimeType(pattern), mimeTypes.map(normalizeMimeType));
    }
    exports.matchesMimeType = matchesMimeType;
    function matchesMimeType_normalized(normalizedPattern, normalizedMimeTypes) {
        // Anything wildcard
        if (normalizedPattern === '*/*') {
            return normalizedMimeTypes.length > 0;
        }
        // Exact match
        if (normalizedMimeTypes.includes(normalizedPattern)) {
            return true;
        }
        // Wildcard, such as `image/*`
        const wildcard = normalizedPattern.match(/^([a-z]+)\/([a-z]+|\*)$/i);
        if (!wildcard) {
            return false;
        }
        const [_, type, subtype] = wildcard;
        if (subtype === '*') {
            return normalizedMimeTypes.some(mime => mime.startsWith(type + '/'));
        }
        return false;
    }
    exports.UriList = Object.freeze({
        // http://amundsen.com/hypermedia/urilist/
        create: (entries) => {
            return (0, arrays_1.distinct)(entries.map(x => x.toString())).join('\r\n');
        },
        split: (str) => {
            return str.split('\r\n');
        },
        parse: (str) => {
            return exports.UriList.split(str).filter(value => !value.startsWith('#'));
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YVRyYW5zZmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9kYXRhVHJhbnNmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0JoRyxTQUFnQiw0QkFBNEIsQ0FBQyxlQUF5QztRQUNyRixPQUFPO1lBQ04sUUFBUSxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsZUFBZTtZQUNyQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUztZQUN2QixLQUFLLEVBQUUsT0FBTyxlQUFlLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVM7U0FDeEUsQ0FBQztJQUNILENBQUM7SUFORCxvRUFNQztJQUVELFNBQWdCLDBCQUEwQixDQUFDLFFBQWdCLEVBQUUsR0FBb0IsRUFBRSxJQUErQjtRQUNqSCxNQUFNLElBQUksR0FBRyxFQUFFLEVBQUUsRUFBRSxJQUFBLG1CQUFZLEdBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUMvRCxPQUFPO1lBQ04sUUFBUSxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsRUFBRTtZQUN4QixNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTtZQUNsQixLQUFLLEVBQUUsU0FBUztTQUNoQixDQUFDO0lBQ0gsQ0FBQztJQVBELGdFQU9DO0lBK0JELE1BQWEsY0FBYztRQUEzQjtZQUVrQixhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQStCLENBQUM7UUF5RXBFLENBQUM7UUF2RUEsSUFBVyxJQUFJO1lBQ2QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQy9CLElBQUksRUFBRSxDQUFDO1lBQ1IsQ0FBQztZ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
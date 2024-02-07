/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineRangeFragment = exports.isSpace = exports.Array2D = void 0;
    class Array2D {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.array = [];
            this.array = new Array(width * height);
        }
        get(x, y) {
            return this.array[x + y * this.width];
        }
        set(x, y, value) {
            this.array[x + y * this.width] = value;
        }
    }
    exports.Array2D = Array2D;
    function isSpace(charCode) {
        return charCode === 32 /* CharCode.Space */ || charCode === 9 /* CharCode.Tab */;
    }
    exports.isSpace = isSpace;
    class LineRangeFragment {
        static { this.chrKeys = new Map(); }
        static getKey(chr) {
            let key = this.chrKeys.get(chr);
            if (key === undefined) {
                key = this.chrKeys.size;
                this.chrKeys.set(chr, key);
            }
            return key;
        }
        constructor(range, lines, source) {
            this.range = range;
            this.lines = lines;
            this.source = source;
            this.histogram = [];
            let counter = 0;
            for (let i = range.startLineNumber - 1; i < range.endLineNumberExclusive - 1; i++) {
                const line = lines[i];
                for (let j = 0; j < line.length; j++) {
                    counter++;
                    const chr = line[j];
                    const key = LineRangeFragment.getKey(chr);
                    this.histogram[key] = (this.histogram[key] || 0) + 1;
                }
                counter++;
                const key = LineRangeFragment.getKey('\n');
                this.histogram[key] = (this.histogram[key] || 0) + 1;
            }
            this.totalCount = counter;
        }
        computeSimilarity(other) {
            let sumDifferences = 0;
            const maxLength = Math.max(this.histogram.length, other.histogram.length);
            for (let i = 0; i < maxLength; i++) {
                sumDifferences += Math.abs((this.histogram[i] ?? 0) - (other.histogram[i] ?? 0));
            }
            return 1 - (sumDifferences / (this.totalCount + other.totalCount));
        }
    }
    exports.LineRangeFragment = LineRangeFragment;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vZGlmZi9kZWZhdWx0TGluZXNEaWZmQ29tcHV0ZXIvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsT0FBTztRQUduQixZQUE0QixLQUFhLEVBQWtCLE1BQWM7WUFBN0MsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUFrQixXQUFNLEdBQU4sTUFBTSxDQUFRO1lBRnhELFVBQUssR0FBUSxFQUFFLENBQUM7WUFHaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELEdBQUcsQ0FBQyxDQUFTLEVBQUUsQ0FBUztZQUN2QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVELEdBQUcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQVE7WUFDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDeEMsQ0FBQztLQUNEO0lBZEQsMEJBY0M7SUFFRCxTQUFnQixPQUFPLENBQUMsUUFBZ0I7UUFDdkMsT0FBTyxRQUFRLDRCQUFtQixJQUFJLFFBQVEseUJBQWlCLENBQUM7SUFDakUsQ0FBQztJQUZELDBCQUVDO0lBRUQsTUFBYSxpQkFBaUI7aUJBQ2QsWUFBTyxHQUFHLElBQUksR0FBRyxFQUFrQixBQUE1QixDQUE2QjtRQUUzQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQVc7WUFDaEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMs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
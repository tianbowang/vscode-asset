/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/characterClassifier"], function (require, exports, characterClassifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMapForWordSeparators = exports.WordCharacterClassifier = exports.WordCharacterClass = void 0;
    var WordCharacterClass;
    (function (WordCharacterClass) {
        WordCharacterClass[WordCharacterClass["Regular"] = 0] = "Regular";
        WordCharacterClass[WordCharacterClass["Whitespace"] = 1] = "Whitespace";
        WordCharacterClass[WordCharacterClass["WordSeparator"] = 2] = "WordSeparator";
    })(WordCharacterClass || (exports.WordCharacterClass = WordCharacterClass = {}));
    class WordCharacterClassifier extends characterClassifier_1.CharacterClassifier {
        constructor(wordSeparators) {
            super(0 /* WordCharacterClass.Regular */);
            for (let i = 0, len = wordSeparators.length; i < len; i++) {
                this.set(wordSeparators.charCodeAt(i), 2 /* WordCharacterClass.WordSeparator */);
            }
            this.set(32 /* CharCode.Space */, 1 /* WordCharacterClass.Whitespace */);
            this.set(9 /* CharCode.Tab */, 1 /* WordCharacterClass.Whitespace */);
        }
    }
    exports.WordCharacterClassifier = WordCharacterClassifier;
    function once(computeFn) {
        const cache = {}; // TODO@Alex unbounded cache
        return (input) => {
            if (!cache.hasOwnProperty(input)) {
                cache[input] = computeFn(input);
            }
            return cache[input];
        };
    }
    exports.getMapForWordSeparators = once((input) => new WordCharacterClassifier(input));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZENoYXJhY3RlckNsYXNzaWZpZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vY29yZS93b3JkQ2hhcmFjdGVyQ2xhc3NpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsSUFBa0Isa0JBSWpCO0lBSkQsV0FBa0Isa0JBQWtCO1FBQ25DLGlFQUFXLENBQUE7UUFDWCx1RUFBYyxDQUFBO1FBQ2QsNkVBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQUppQixrQkFBa0Isa0NBQWxCLGtCQUFrQixRQUluQztJQUVELE1BQWEsdUJBQXdCLFNBQVEseUNBQXVDO1FBRW5GLFlBQVksY0FBc0I7WUFDakMsS0FBSyxvQ0FBNEIsQ0FBQztZQUVsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQzNELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsMkNBQW1DLENBQUM7WUFDMUUsQ0FBQztZQUVELElBQUksQ0FBQyxHQUFHLGdFQUErQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxHQUFHLDZEQUE2QyxDQUFDO1FBQ3ZELENBQUM7S0FFRDtJQWJELDBEQWFDO0lBRUQsU0FBUyxJQUFJLENBQUksU0FBK0I7UUFDL0MsTUFBTSxLQUFLLEdBQXlCLEVBQUUsQ0FBQyxDQUFDLDRCQUE0QjtRQUNwRSxPQUFPLENBQUMsS0FBYSxFQUFLLEVBQUU7WUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDbEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVZLFFBQUEsdUJBQXVCLEdBQUcsSUFBSSxDQUMxQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsQ0FDN0MsQ0FBQyJ9
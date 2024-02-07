/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/toggle/toggle", "vs/base/common/codicons", "vs/nls"], function (require, exports, toggle_1, codicons_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RegexToggle = exports.WholeWordsToggle = exports.CaseSensitiveToggle = void 0;
    const NLS_CASE_SENSITIVE_TOGGLE_LABEL = nls.localize('caseDescription', "Match Case");
    const NLS_WHOLE_WORD_TOGGLE_LABEL = nls.localize('wordsDescription', "Match Whole Word");
    const NLS_REGEX_TOGGLE_LABEL = nls.localize('regexDescription', "Use Regular Expression");
    class CaseSensitiveToggle extends toggle_1.Toggle {
        constructor(opts) {
            super({
                icon: codicons_1.Codicon.caseSensitive,
                title: NLS_CASE_SENSITIVE_TOGGLE_LABEL + opts.appendTitle,
                isChecked: opts.isChecked,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.CaseSensitiveToggle = CaseSensitiveToggle;
    class WholeWordsToggle extends toggle_1.Toggle {
        constructor(opts) {
            super({
                icon: codicons_1.Codicon.wholeWord,
                title: NLS_WHOLE_WORD_TOGGLE_LABEL + opts.appendTitle,
                isChecked: opts.isChecked,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.WholeWordsToggle = WholeWordsToggle;
    class RegexToggle extends toggle_1.Toggle {
        constructor(opts) {
            super({
                icon: codicons_1.Codicon.regex,
                title: NLS_REGEX_TOGGLE_LABEL + opts.appendTitle,
                isChecked: opts.isChecked,
                inputActiveOptionBorder: opts.inputActiveOptionBorder,
                inputActiveOptionForeground: opts.inputActiveOptionForeground,
                inputActiveOptionBackground: opts.inputActiveOptionBackground
            });
        }
    }
    exports.RegexToggle = RegexToggle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZElucHV0VG9nZ2xlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2ZpbmRpbnB1dC9maW5kSW5wdXRUb2dnbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWNoRyxNQUFNLCtCQUErQixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDdEYsTUFBTSwyQkFBMkIsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFDekYsTUFBTSxzQkFBc0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFFMUYsTUFBYSxtQkFBb0IsU0FBUSxlQUFNO1FBQzlDLFlBQVksSUFBMEI7WUFDckMsS0FBSyxDQUFDO2dCQUNMLElBQUksRUFBRSxrQkFBTyxDQUFDLGFBQWE7Z0JBQzNCLEtBQUssRUFBRSwrQkFBK0IsR0FBRyxJQUFJLENBQUMsV0FBVztnQkFDekQsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6Qix1QkFBdUIsRUFBRSxJQUFJLENBQUMsdUJBQXVCO2dCQUNyRCwyQkFBMkIsRUFBRSxJQUFJLENBQUMsMkJBQTJCO2dCQUM3RCwyQkFBMkIsRUFBRSxJQUFJLENBQUMsMkJBQTJCO2FBQzdELENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQVhELGtEQVdDO0lBRUQsTUFBYSxnQkFBaUIsU0FBUSxlQUFNO1FBQzNDLFlBQVksSUFBMEI7WUFDckMsS0FBSyxDQUFDO2dCQUNMLElBQUksRUFBRSxrQkFBTyxDQUFDLFNBQVM7Z0JBQ3ZCLEtBQUssRUFBRSwyQkFBMkIsR0FBRyxJQUFJLENBQUMsV0FBVztnQkFDckQsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6Qix1QkFBdUIsRUFBRSxJQUFJLENBQUMsdUJBQXVCO2dCQUNyRCwyQkFBMkIsRUFBRSxJQUFJLENBQUMsMkJBQTJCO2dCQUM3RCwyQkFBMkIsRUFBRSxJQUFJLENBQUMsMkJBQTJCO2FBQzdELENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQVhELDRDQVdDO0lBRUQsTUFBYSxXQUFZLFNBQVEsZUFBTTtRQUN0QyxZQUFZLElBQTBCO1lBQ3JDLEtBQUssQ0FBQztnQkFDTCxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxLQUFLO2dCQUNuQixLQUFLLEVBQUUsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLFdBQVc7Z0JBQ2hELFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDekIsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QjtnQkFDckQsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLDJCQUEyQjtnQkFDN0QsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLDJCQUEyQjthQUM3RCxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFYRCxrQ0FXQyJ9
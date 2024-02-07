/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildReplaceStringWithCasePreserved = void 0;
    function buildReplaceStringWithCasePreserved(matches, pattern) {
        if (matches && (matches[0] !== '')) {
            const containsHyphens = validateSpecificSpecialCharacter(matches, pattern, '-');
            const containsUnderscores = validateSpecificSpecialCharacter(matches, pattern, '_');
            if (containsHyphens && !containsUnderscores) {
                return buildReplaceStringForSpecificSpecialCharacter(matches, pattern, '-');
            }
            else if (!containsHyphens && containsUnderscores) {
                return buildReplaceStringForSpecificSpecialCharacter(matches, pattern, '_');
            }
            if (matches[0].toUpperCase() === matches[0]) {
                return pattern.toUpperCase();
            }
            else if (matches[0].toLowerCase() === matches[0]) {
                return pattern.toLowerCase();
            }
            else if (strings.containsUppercaseCharacter(matches[0][0]) && pattern.length > 0) {
                return pattern[0].toUpperCase() + pattern.substr(1);
            }
            else if (matches[0][0].toUpperCase() !== matches[0][0] && pattern.length > 0) {
                return pattern[0].toLowerCase() + pattern.substr(1);
            }
            else {
                // we don't understand its pattern yet.
                return pattern;
            }
        }
        else {
            return pattern;
        }
    }
    exports.buildReplaceStringWithCasePreserved = buildReplaceStringWithCasePreserved;
    function validateSpecificSpecialCharacter(matches, pattern, specialCharacter) {
        const doesContainSpecialCharacter = matches[0].indexOf(specialCharacter) !== -1 && pattern.indexOf(specialCharacter) !== -1;
        return doesContainSpecialCharacter && matches[0].split(specialCharacter).length === pattern.split(specialCharacter).length;
    }
    function buildReplaceStringForSpecificSpecialCharacter(matches, pattern, specialCharacter) {
        const splitPatternAtSpecialCharacter = pattern.split(specialCharacter);
        const splitMatchAtSpecialCharacter = matches[0].split(specialCharacter);
        let replaceString = '';
        splitPatternAtSpecialCharacter.forEach((splitValue, index) => {
            replaceString += buildReplaceStringWithCasePreserved([splitMatchAtSpecialCharacter[index]], splitValue) + specialCharacter;
        });
        return replaceString.slice(0, -1);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9zZWFyY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLFNBQWdCLG1DQUFtQyxDQUFDLE9BQXdCLEVBQUUsT0FBZTtRQUM1RixJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ3BDLE1BQU0sZUFBZSxHQUFHLGdDQUFnQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDaEYsTUFBTSxtQkFBbUIsR0FBRyxnQ0FBZ0MsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3BGLElBQUksZUFBZSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDN0MsT0FBTyw2Q0FBNkMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzdFLENBQUM7aUJBQU0sSUFBSSxDQUFDLGVBQWUsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO2dCQUNwRCxPQUFPLDZDQUE2QyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDN0UsQ0FBQztZQUNELElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM3QyxPQUFPLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM5QixDQUFDO2lCQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNwRCxPQUFPLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM5QixDQUFDO2lCQUFNLElBQUksT0FBTyxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BGLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsQ0FBQztpQkFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDaEYsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsdUNBQXVDO2dCQUN2QyxPQUFPLE9BQU8sQ0FBQztZQUNoQixDQUFDO1FBQ0YsQ0FBQzthQUFNLENBQUM7WUFDUCxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO0lBQ0YsQ0FBQztJQXhCRCxrRkF3QkM7SUFFRCxTQUFTLGdDQUFnQyxDQUFDLE9BQWlCLEVBQUUsT0FBZSxFQUFFLGdCQUF3QjtRQUNyRyxNQUFNLDJCQUEyQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDNUgsT0FBTywyQkFBMkIsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDNUgsQ0FBQztJQUVELFNBQVMsNkNBQTZDLENBQUMsT0FBaUIsRUFBRSxPQUFlLEVBQUUsZ0JBQXdCO1FBQ2xILE1BQU0sOEJBQThCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sNEJBQTRCLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hFLElBQUksYUFBYSxHQUFXLEVBQUUsQ0FBQztRQUMvQiw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDNUQsYUFBYSxJQUFJLG1DQUFtQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztRQUM1SCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDIn0=
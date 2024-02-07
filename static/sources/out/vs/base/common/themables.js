/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons"], function (require, exports, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ThemeIcon = exports.themeColorFromId = exports.ThemeColor = void 0;
    var ThemeColor;
    (function (ThemeColor) {
        function isThemeColor(obj) {
            return obj && typeof obj === 'object' && typeof obj.id === 'string';
        }
        ThemeColor.isThemeColor = isThemeColor;
    })(ThemeColor || (exports.ThemeColor = ThemeColor = {}));
    function themeColorFromId(id) {
        return { id };
    }
    exports.themeColorFromId = themeColorFromId;
    var ThemeIcon;
    (function (ThemeIcon) {
        ThemeIcon.iconNameSegment = '[A-Za-z0-9]+';
        ThemeIcon.iconNameExpression = '[A-Za-z0-9-]+';
        ThemeIcon.iconModifierExpression = '~[A-Za-z]+';
        ThemeIcon.iconNameCharacter = '[A-Za-z0-9~-]';
        const ThemeIconIdRegex = new RegExp(`^(${ThemeIcon.iconNameExpression})(${ThemeIcon.iconModifierExpression})?$`);
        function asClassNameArray(icon) {
            const match = ThemeIconIdRegex.exec(icon.id);
            if (!match) {
                return asClassNameArray(codicons_1.Codicon.error);
            }
            const [, id, modifier] = match;
            const classNames = ['codicon', 'codicon-' + id];
            if (modifier) {
                classNames.push('codicon-modifier-' + modifier.substring(1));
            }
            return classNames;
        }
        ThemeIcon.asClassNameArray = asClassNameArray;
        function asClassName(icon) {
            return asClassNameArray(icon).join(' ');
        }
        ThemeIcon.asClassName = asClassName;
        function asCSSSelector(icon) {
            return '.' + asClassNameArray(icon).join('.');
        }
        ThemeIcon.asCSSSelector = asCSSSelector;
        function isThemeIcon(obj) {
            return obj && typeof obj === 'object' && typeof obj.id === 'string' && (typeof obj.color === 'undefined' || ThemeColor.isThemeColor(obj.color));
        }
        ThemeIcon.isThemeIcon = isThemeIcon;
        const _regexFromString = new RegExp(`^\\$\\((${ThemeIcon.iconNameExpression}(?:${ThemeIcon.iconModifierExpression})?)\\)$`);
        function fromString(str) {
            const match = _regexFromString.exec(str);
            if (!match) {
                return undefined;
            }
            const [, name] = match;
            return { id: name };
        }
        ThemeIcon.fromString = fromString;
        function fromId(id) {
            return { id };
        }
        ThemeIcon.fromId = fromId;
        function modify(icon, modifier) {
            let id = icon.id;
            const tildeIndex = id.lastIndexOf('~');
            if (tildeIndex !== -1) {
                id = id.substring(0, tildeIndex);
            }
            if (modifier) {
                id = `${id}~${modifier}`;
            }
            return { id };
        }
        ThemeIcon.modify = modify;
        function getModifier(icon) {
            const tildeIndex = icon.id.lastIndexOf('~');
            if (tildeIndex !== -1) {
                return icon.id.substring(tildeIndex + 1);
            }
            return undefined;
        }
        ThemeIcon.getModifier = getModifier;
        function isEqual(ti1, ti2) {
            return ti1.id === ti2.id && ti1.color?.id === ti2.color?.id;
        }
        ThemeIcon.isEqual = isEqual;
    })(ThemeIcon || (exports.ThemeIcon = ThemeIcon = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWFibGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi90aGVtYWJsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLElBQWlCLFVBQVUsQ0FJMUI7SUFKRCxXQUFpQixVQUFVO1FBQzFCLFNBQWdCLFlBQVksQ0FBQyxHQUFRO1lBQ3BDLE9BQU8sR0FBRyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxPQUFvQixHQUFJLENBQUMsRUFBRSxLQUFLLFFBQVEsQ0FBQztRQUNuRixDQUFDO1FBRmUsdUJBQVksZUFFM0IsQ0FBQTtJQUNGLENBQUMsRUFKZ0IsVUFBVSwwQkFBVixVQUFVLFFBSTFCO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsRUFBbUI7UUFDbkQsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUZELDRDQUVDO0lBUUQsSUFBaUIsU0FBUyxDQXdFekI7SUF4RUQsV0FBaUIsU0FBUztRQUNaLHlCQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ2pDLDRCQUFrQixHQUFHLGVBQWUsQ0FBQztRQUNyQyxnQ0FBc0IsR0FBRyxZQUFZLENBQUM7UUFDdEMsMkJBQWlCLEdBQUcsZUFBZSxDQUFDO1FBRWpELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxVQUFBLGtCQUFrQixLQUFLLFVBQUEsc0JBQXNCLEtBQUssQ0FBQyxDQUFDO1FBRTdGLFNBQWdCLGdCQUFnQixDQUFDLElBQWU7WUFDL0MsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ1osT0FBTyxnQkFBZ0IsQ0FBQyxrQkFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLENBQUM7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
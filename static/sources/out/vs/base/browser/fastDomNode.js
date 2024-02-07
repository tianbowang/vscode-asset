/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createFastDomNode = exports.FastDomNode = void 0;
    class FastDomNode {
        constructor(domNode) {
            this.domNode = domNode;
            this._maxWidth = '';
            this._width = '';
            this._height = '';
            this._top = '';
            this._left = '';
            this._bottom = '';
            this._right = '';
            this._paddingTop = '';
            this._paddingLeft = '';
            this._paddingBottom = '';
            this._paddingRight = '';
            this._fontFamily = '';
            this._fontWeight = '';
            this._fontSize = '';
            this._fontStyle = '';
            this._fontFeatureSettings = '';
            this._fontVariationSettings = '';
            this._textDecoration = '';
            this._lineHeight = '';
            this._letterSpacing = '';
            this._className = '';
            this._display = '';
            this._position = '';
            this._visibility = '';
            this._color = '';
            this._backgroundColor = '';
            this._layerHint = false;
            this._contain = 'none';
            this._boxShadow = '';
        }
        setMaxWidth(_maxWidth) {
            const maxWidth = numberAsPixels(_maxWidth);
            if (this._maxWidth === maxWidth) {
                return;
            }
            this._maxWidth = maxWidth;
            this.domNode.style.maxWidth = this._maxWidth;
        }
        setWidth(_width) {
            const width = numberAsPixels(_width);
            if (this._width === width) {
                return;
            }
            this._width = width;
            this.domNode.style.width = this._width;
        }
        setHeight(_height) {
            const height = numberAsPixels(_height);
            if (this._height === height) {
                return;
            }
            this._height = height;
            this.domNode.style.height = this._height;
        }
        setTop(_top) {
            const top = numberAsPixels(_top);
            if (this._top === top) {
                return;
            }
            this._top = top;
            this.domNode.style.top = this._top;
        }
        setLeft(_left) {
            const left = numberAsPixels(_left);
            if (this._left === left) {
                return;
            }
            this._left = left;
            this.domNode.style.left = this._left;
        }
        setBottom(_bottom) {
            const bottom = numberAsPixels(_bottom);
            if (this._bottom === bottom) {
                return;
            }
            this._bottom = bottom;
            this.domNode.style.bottom = this._bottom;
        }
        setRight(_right) {
            const right = numberAsPixels(_right);
            if (this._right === right) {
                return;
            }
            this._right = right;
            this.domNode.style.right = this._right;
        }
        setPaddingTop(_paddingTop) {
            const paddingTop = numberAsPixels(_paddingTop);
            if (this._paddingTop === paddingTop) {
                return;
            }
            this._paddingTop = paddingTop;
            this.domNode.style.paddingTop = this._paddingTop;
        }
        setPaddingLeft(_paddingLeft) {
            const paddingLeft = numberAsPixels(_paddingLeft);
            if (this._paddingLeft === paddingLeft) {
                return;
            }
            this._paddingLeft = paddingLeft;
            this.domNode.style.paddingLeft = this._paddingLeft;
        }
        setPaddingBottom(_paddingBottom) {
            const paddingBottom = numberAsPixels(_paddingBottom);
            if (this._paddingBottom === paddingBottom) {
                return;
            }
            this._paddingBottom = paddingBottom;
            this.domNode.style.paddingBottom = this._paddingBottom;
        }
        setPaddingRight(_paddingRight) {
            const paddingRight = numberAsPixels(_paddingRight);
            if (this._paddingRight === paddingRight) {
                return;
            }
            this._paddingRight = paddingRight;
            this.domNode.style.paddingRight = this._paddingRight;
        }
        setFontFamily(fontFamily) {
            if (this._fontFamily === fontFamily) {
                return;
            }
            this._fontFamily = fontFamily;
            this.domNode.style.fontFamily = this._fontFamily;
        }
        setFontWeight(fontWeight) {
            if (this._fontWeight === fontWeight) {
                return;
            }
            this._fontWeight = fontWeight;
            this.domNode.style.fontWeight = this._fontWeight;
        }
        setFontSize(_fontSize) {
            const fontSize = numberAsPixels(_fontSize);
            if (this._fontSize === fontSize) {
                return;
            }
            this._fontSize = fontSize;
            this.domNode.style.fontSize = this._fontSize;
        }
        setFontStyle(fontStyle) {
            if (this._fontStyle === fontStyle) {
                return;
            }
            this._fontStyle = fontStyle;
            this.domNode.style.fontStyle = this._fontStyle;
        }
        setFontFeatureSettings(fontFeatureSettings) {
            if (this._fontFeatureSettings === fontFeatureSettings) {
                return;
            }
            this._fontFeatureSettings = fontFeatureSettings;
            this.domNode.style.fontFeatureSettings = this._fontFeatureSettings;
        }
        setFontVariationSettings(fontVariationSettings) {
            if (this._fontVariationSettings === fontVariationSettings) {
                return;
            }
            this._fontVariationSettings = fontVariationSettings;
            this.domNode.style.fontVariationSettings = this._fontVariationSettings;
        }
        setTextDecoration(textDecoration) {
            if (this._textDecoration === textDecoration) {
                return;
            }
            this._textDecoration = textDecoration;
            this.domNode.style.textDecoration = this._textDecoration;
        }
        setLineHeight(_lineHeight) {
            const lineHeight = numberAsPixels(_lineHeight);
            if (this._lineHeight === lineHeight) {
                return;
            }
            this._lineHeight = lineHeight;
            this.domNode.style.lineHeight = this._lineHeight;
        }
        setLetterSpacing(_letterSpacing) {
            const letterSpacing = numberAsPixels(_letterSpacing);
            if (this._letterSpacing === letterSpacing) {
                return;
            }
            this._letterSpacing = letterSpacing;
            this.domNode.style.letterSpacing = this._letterSpacing;
        }
        setClassName(className) {
            if (this._className === className) {
                return;
            }
            this._className = className;
            this.domNode.className = this._className;
        }
        toggleClassName(className, shouldHaveIt) {
            this.domNode.classList.toggle(className, shouldHaveIt);
            this._className = this.domNode.className;
        }
        setDisplay(display) {
            if (this._display === display) {
                return;
            }
            this._display = display;
            this.domNode.style.display = this._display;
        }
        setPosition(position) {
            if (this._position === position) {
                return;
            }
            this._position = position;
            this.domNode.style.position = this._position;
        }
        setVisibility(visibility) {
            if (this._visibility === visibility) {
                return;
            }
            this._visibility = visibility;
            this.domNode.style.visibility = this._visibility;
        }
        setColor(color) {
            if (this._color === color) {
                return;
            }
            this._color = color;
            this.domNode.style.color = this._color;
        }
        setBackgroundColor(backgroundColor) {
            if (this._backgroundColor === backgroundColor) {
                return;
            }
            this._backgroundColor = backgroundColor;
            this.domNode.style.backgroundColor = this._backgroundColor;
        }
        setLayerHinting(layerHint) {
            if (this._layerHint === layerHint) {
                return;
            }
            this._layerHint = layerHint;
            this.domNode.style.transform = this._layerHint ? 'translate3d(0px, 0px, 0px)' : '';
        }
        setBoxShadow(boxShadow) {
            if (this._boxShadow === boxShadow) {
                return;
            }
            this._boxShadow = boxShadow;
            this.domNode.style.boxShadow = boxShadow;
        }
        setContain(contain) {
            if (this._contain === contain) {
                return;
            }
            this._contain = contain;
            this.domNode.style.contain = this._contain;
        }
        setAttribute(name, value) {
            this.domNode.setAttribute(name, value);
        }
        removeAttribute(name) {
            this.domNode.removeAttribute(name);
        }
        appendChild(child) {
            this.domNode.appendChild(child.domNode);
        }
        removeChild(child) {
            this.domNode.removeChild(child.domNode);
        }
    }
    exports.FastDomNode = FastDomNode;
    function numberAsPixels(value) {
        return (typeof value === 'number' ? `${value}px` : value);
    }
    function createFastDomNode(domNode) {
        return new FastDomNode(domNode);
    }
    exports.createFastDomNode = createFastDomNode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFzdERvbU5vZGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci9mYXN0RG9tTm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEcsTUFBYSxXQUFXO1FBZ0N2QixZQUNpQixPQUFVO1lBQVYsWUFBTyxHQUFQLE9BQU8sQ0FBRztZQS9CbkIsY0FBUyxHQUFXLEVBQUUsQ0FBQztZQUN2QixXQUFNLEdBQVcsRUFBRSxDQUFDO1lBQ3BCLFlBQU8sR0FBVyxFQUFFLENBQUM7WUFDckIsU0FBSSxHQUFXLEVBQUUsQ0FBQztZQUNsQixVQUFLLEdBQVcsRUFBRSxDQUFDO1lBQ25CLFlBQU8sR0FBVyxFQUFFLENBQUM7WUFDckIsV0FBTSxHQUFXLEVBQUUsQ0FBQztZQUNwQixnQkFBVyxHQUFXLEVBQUUsQ0FBQztZQUN6QixpQkFBWSxHQUFXLEVBQUUsQ0FBQztZQUMxQixtQkFBYyxHQUFXLEVBQUUsQ0FBQztZQUM1QixrQkFBYSxHQUFXLEVBQUUsQ0FBQztZQUMzQixnQkFBVyxHQUFXLEVBQUUsQ0FBQztZQUN6QixnQkFBVyxHQUFXLEVBQUUsQ0FBQztZQUN6QixjQUFTLEdBQVcsRUFBRSxDQUFDO1lBQ3ZCLGVBQVUsR0FBVyxFQUFFLENBQUM7WUFDeEIseUJBQW9CLEdBQVcsRUFBRSxDQUFDO1lBQ2xDLDJCQUFzQixHQUFXLEVBQUUsQ0FBQztZQUNwQyxvQkFBZSxHQUFXLEVBQUUsQ0FBQztZQUM3QixnQkFBVyxHQUFXLEVBQUUsQ0FBQztZQUN6QixtQkFBYyxHQUFXLEVBQUUsQ0FBQztZQUM1QixlQUFVLEdBQVcsRUFBRSxDQUFDO1lBQ3hCLGFBQVEsR0FBVyxFQUFFLENBQUM7WUFDdEIsY0FBUyxHQUFXLEVBQUUsQ0FBQztZQUN2QixnQkFBVyxHQUFXLEVBQUUsQ0FBQztZQUN6QixXQUFNLEdBQVcsRUFBRSxD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
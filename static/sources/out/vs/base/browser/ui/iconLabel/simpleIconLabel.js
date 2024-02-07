/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels"], function (require, exports, dom_1, iconLabels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleIconLabel = void 0;
    class SimpleIconLabel {
        constructor(_container) {
            this._container = _container;
        }
        set text(text) {
            (0, dom_1.reset)(this._container, ...(0, iconLabels_1.renderLabelWithIcons)(text ?? ''));
        }
        set title(title) {
            this._container.title = title;
        }
    }
    exports.SimpleIconLabel = SimpleIconLabel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlSWNvbkxhYmVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvaWNvbkxhYmVsL3NpbXBsZUljb25MYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsTUFBYSxlQUFlO1FBRTNCLFlBQ2tCLFVBQXVCO1lBQXZCLGVBQVUsR0FBVixVQUFVLENBQWE7UUFDckMsQ0FBQztRQUVMLElBQUksSUFBSSxDQUFDLElBQVk7WUFDcEIsSUFBQSxXQUFLLEVBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLElBQUEsaUNBQW9CLEVBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVELElBQUksS0FBSyxDQUFDLEtBQWE7WUFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQy9CLENBQUM7S0FDRDtJQWJELDBDQWFDIn0=
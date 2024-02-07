/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/theme/common/colorRegistry"], function (require, exports, nls_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.multiDiffEditorBorder = exports.multiDiffEditorBackground = exports.multiDiffEditorHeaderBackground = void 0;
    exports.multiDiffEditorHeaderBackground = (0, colorRegistry_1.registerColor)('multiDiffEditor.headerBackground', { dark: '#808080', light: '#b4b4b4', hcDark: '#808080', hcLight: '#b4b4b4', }, (0, nls_1.localize)('multiDiffEditor.headerBackground', 'The background color of the diff editor\'s header'));
    exports.multiDiffEditorBackground = (0, colorRegistry_1.registerColor)('multiDiffEditor.background', { dark: '#000000', light: '#e5e5e5', hcDark: '#000000', hcLight: '#e5e5e5', }, (0, nls_1.localize)('multiDiffEditor.background', 'The background color of the multi file diff editor'));
    exports.multiDiffEditorBorder = (0, colorRegistry_1.registerColor)('multiDiffEditor.border', { dark: 'sideBarSectionHeader.border', light: '#cccccc', hcDark: 'sideBarSectionHeader.border', hcLight: '#cccccc', }, (0, nls_1.localize)('multiDiffEditor.border', 'The border color of the multi file diff editor'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvbXVsdGlEaWZmRWRpdG9yV2lkZ2V0L2NvbG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLbkYsUUFBQSwrQkFBK0IsR0FBRyxJQUFBLDZCQUFhLEVBQzNELGtDQUFrQyxFQUNsQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLEdBQUcsRUFDN0UsSUFBQSxjQUFRLEVBQUMsa0NBQWtDLEVBQUUsbURBQW1ELENBQUMsQ0FDakcsQ0FBQztJQUVXLFFBQUEseUJBQXlCLEdBQUcsSUFBQSw2QkFBYSxFQUNyRCw0QkFBNEIsRUFDNUIsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxHQUFHLEVBQzdFLElBQUEsY0FBUSxFQUFDLDRCQUE0QixFQUFFLG9EQUFvRCxDQUFDLENBQzVGLENBQUM7SUFFVyxRQUFBLHFCQUFxQixHQUFHLElBQUEsNkJBQWEsRUFDakQsd0JBQXdCLEVBQ3hCLEVBQUUsSUFBSSxFQUFFLDZCQUE2QixFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLDZCQUE2QixFQUFFLE9BQU8sRUFBRSxTQUFTLEdBQUcsRUFDckgsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsZ0RBQWdELENBQUMsQ0FDcEYsQ0FBQyJ9
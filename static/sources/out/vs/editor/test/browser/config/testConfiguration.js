/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/config/editorConfiguration", "vs/editor/common/config/editorOptions", "vs/editor/common/config/fontInfo", "vs/platform/accessibility/test/common/testAccessibilityService"], function (require, exports, editorConfiguration_1, editorOptions_1, fontInfo_1, testAccessibilityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestConfiguration = void 0;
    class TestConfiguration extends editorConfiguration_1.EditorConfiguration {
        constructor(opts) {
            super(false, opts, null, new testAccessibilityService_1.TestAccessibilityService());
        }
        _readEnvConfiguration() {
            return {
                extraEditorClassName: '',
                outerWidth: 100,
                outerHeight: 100,
                emptySelectionClipboard: true,
                pixelRatio: 1,
                accessibilitySupport: 0 /* AccessibilitySupport.Unknown */
            };
        }
        _readFontInfo(styling) {
            return new fontInfo_1.FontInfo({
                pixelRatio: 1,
                fontFamily: 'mockFont',
                fontWeight: 'normal',
                fontSize: 14,
                fontFeatureSettings: editorOptions_1.EditorFontLigatures.OFF,
                fontVariationSettings: editorOptions_1.EditorFontVariations.OFF,
                lineHeight: 19,
                letterSpacing: 1.5,
                isMonospace: true,
                typicalHalfwidthCharacterWidth: 10,
                typicalFullwidthCharacterWidth: 20,
                canUseHalfwidthRightwardsArrow: true,
                spaceWidth: 10,
                middotWidth: 10,
                wsmiddotWidth: 10,
                maxDigitWidth: 10,
            }, true);
        }
    }
    exports.TestConfiguration = TestConfiguration;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2Jyb3dzZXIvY29uZmlnL3Rlc3RDb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxNQUFhLGlCQUFrQixTQUFRLHlDQUFtQjtRQUV6RCxZQUFZLElBQW9CO1lBQy9CLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLG1EQUF3QixFQUFFLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRWtCLHFCQUFxQjtZQUN2QyxPQUFPO2dCQUNOLG9CQUFvQixFQUFFLEVBQUU7Z0JBQ3hCLFVBQVUsRUFBRSxHQUFHO2dCQUNmLFdBQVcsRUFBRSxHQUFHO2dCQUNoQix1QkFBdUIsRUFBRSxJQUFJO2dCQUM3QixVQUFVLEVBQUUsQ0FBQztnQkFDYixvQkFBb0Isc0NBQThCO2FBQ2xELENBQUM7UUFDSCxDQUFDO1FBRWtCLGFBQWEsQ0FBQyxPQUFxQjtZQUNyRCxPQUFPLElBQUksbUJBQVEsQ0FBQztnQkFDbkIsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLFVBQVUsRUFBRSxRQUFRO2dCQUNwQixRQUFRLEVBQUUsRUFBRTtnQkFDWixtQkFBbUIsRUFBRSxtQ0FBbUIsQ0FBQyxHQUFHO2dCQUM1QyxxQkFBcUIsRUFBRSxvQ0FBb0IsQ0FBQyxHQUFHO2dCQUMvQyxVQUFVLEVBQUUsRUFBRTtnQkFDZCxhQUFhLEVBQUUsR0FBRztnQkFDbEIsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLDhCQUE4QixFQUFFLEVBQUU7Z0JBQ2xDLDhCQUE4QixFQUFFLEVBQUU7Z0JBQ2xDLDhCQUE4QixFQUFFLElBQUk7Z0JBQ3BDLFVBQVUsRUFBRSxFQUFFO2dCQUNkLFdBQVcsRUFBRSxFQUFFO2dCQUNmLGFBQWEsRUFBRSxFQUFFO2dCQUNqQixhQUFhLEVBQUUsRUFBRTthQUNqQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ1YsQ0FBQztLQUNEO0lBckNELDhDQXFDQyJ9
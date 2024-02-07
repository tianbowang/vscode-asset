/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/platform/theme/common/colorRegistry", "vs/editor/common/core/editorColorRegistry"], function (require, exports, color_1, colorRegistry, editorColorRegistry) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.convertSettings = void 0;
    const settingToColorIdMapping = {};
    function addSettingMapping(settingId, colorId) {
        let colorIds = settingToColorIdMapping[settingId];
        if (!colorIds) {
            settingToColorIdMapping[settingId] = colorIds = [];
        }
        colorIds.push(colorId);
    }
    function convertSettings(oldSettings, result) {
        for (const rule of oldSettings) {
            result.textMateRules.push(rule);
            if (!rule.scope) {
                const settings = rule.settings;
                if (!settings) {
                    rule.settings = {};
                }
                else {
                    for (const settingKey in settings) {
                        const key = settingKey;
                        const mappings = settingToColorIdMapping[key];
                        if (mappings) {
                            const colorHex = settings[key];
                            if (typeof colorHex === 'string') {
                                const color = color_1.Color.fromHex(colorHex);
                                for (const colorId of mappings) {
                                    result.colors[colorId] = color;
                                }
                            }
                        }
                        if (key !== 'foreground' && key !== 'background' && key !== 'fontStyle') {
                            delete settings[key];
                        }
                    }
                }
            }
        }
    }
    exports.convertSettings = convertSettings;
    addSettingMapping('background', colorRegistry.editorBackground);
    addSettingMapping('foreground', colorRegistry.editorForeground);
    addSettingMapping('selection', colorRegistry.editorSelectionBackground);
    addSettingMapping('inactiveSelection', colorRegistry.editorInactiveSelection);
    addSettingMapping('selectionHighlightColor', colorRegistry.editorSelectionHighlight);
    addSettingMapping('findMatchHighlight', colorRegistry.editorFindMatchHighlight);
    addSettingMapping('currentFindMatchHighlight', colorRegistry.editorFindMatch);
    addSettingMapping('hoverHighlight', colorRegistry.editorHoverHighlight);
    addSettingMapping('wordHighlight', 'editor.wordHighlightBackground'); // inlined to avoid editor/contrib dependenies
    addSettingMapping('wordHighlightStrong', 'editor.wordHighlightStrongBackground');
    addSettingMapping('findRangeHighlight', colorRegistry.editorFindRangeHighlight);
    addSettingMapping('findMatchHighlight', 'peekViewResult.matchHighlightBackground');
    addSettingMapping('referenceHighlight', 'peekViewEditor.matchHighlightBackground');
    addSettingMapping('lineHighlight', editorColorRegistry.editorLineHighlight);
    addSettingMapping('rangeHighlight', editorColorRegistry.editorRangeHighlight);
    addSettingMapping('caret', editorColorRegistry.editorCursorForeground);
    addSettingMapping('invisibles', editorColorRegistry.editorWhitespaces);
    addSettingMapping('guide', editorColorRegistry.editorIndentGuide1);
    addSettingMapping('activeGuide', editorColorRegistry.editorActiveIndentGuide1);
    const ansiColorMap = ['ansiBlack', 'ansiRed', 'ansiGreen', 'ansiYellow', 'ansiBlue', 'ansiMagenta', 'ansiCyan', 'ansiWhite',
        'ansiBrightBlack', 'ansiBrightRed', 'ansiBrightGreen', 'ansiBrightYellow', 'ansiBrightBlue', 'ansiBrightMagenta', 'ansiBrightCyan', 'ansiBrightWhite'
    ];
    for (const color of ansiColorMap) {
        addSettingMapping(color, 'terminal.' + color);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVDb21wYXRpYmlsaXR5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGhlbWVzL2NvbW1vbi90aGVtZUNvbXBhdGliaWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQU0sdUJBQXVCLEdBQXNDLEVBQUUsQ0FBQztJQUN0RSxTQUFTLGlCQUFpQixDQUFDLFNBQWlCLEVBQUUsT0FBZTtRQUM1RCxJQUFJLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDZix1QkFBdUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ3BELENBQUM7UUFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxTQUFnQixlQUFlLENBQUMsV0FBbUMsRUFBRSxNQUFvRTtRQUN4SSxLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2pCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDZixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztnQkFDcEIsQ0FBQztxQkFBTSxDQUFDO29CQUNQLEtBQUssTUFBTSxVQUFVLElBQUksUUFBUSxFQUFFLENBQUM7d0JBQ25DLE1BQU0sR0FBRyxHQUEwQixVQUFVLENBQUM7d0JBQzlDLE1BQU0sUUFBUSxHQUFHLHVCQUF1QixDQUFDLEdBQUcsQ0FB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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme"], function (require, exports, nls, colorRegistry_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerColors = exports.ansiColorMap = exports.TERMINAL_TAB_ACTIVE_BORDER = exports.TERMINAL_DRAG_AND_DROP_BACKGROUND = exports.TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR = exports.TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR = exports.TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR = exports.TERMINAL_FIND_MATCH_BORDER_COLOR = exports.TERMINAL_HOVER_HIGHLIGHT_BACKGROUND_COLOR = exports.TERMINAL_FIND_MATCH_BACKGROUND_COLOR = exports.TERMINAL_BORDER_COLOR = exports.TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR = exports.TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR = exports.TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR = exports.TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR = exports.TERMINAL_SELECTION_FOREGROUND_COLOR = exports.TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR = exports.TERMINAL_SELECTION_BACKGROUND_COLOR = exports.TERMINAL_CURSOR_BACKGROUND_COLOR = exports.TERMINAL_CURSOR_FOREGROUND_COLOR = exports.TERMINAL_FOREGROUND_COLOR = exports.TERMINAL_BACKGROUND_COLOR = exports.ansiColorIdentifiers = void 0;
    /**
     * The color identifiers for the terminal's ansi colors. The index in the array corresponds to the index
     * of the color in the terminal color table.
     */
    exports.ansiColorIdentifiers = [];
    exports.TERMINAL_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.background', null, nls.localize('terminal.background', 'The background color of the terminal, this allows coloring the terminal differently to the panel.'));
    exports.TERMINAL_FOREGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.foreground', {
        light: '#333333',
        dark: '#CCCCCC',
        hcDark: '#FFFFFF',
        hcLight: '#292929'
    }, nls.localize('terminal.foreground', 'The foreground color of the terminal.'));
    exports.TERMINAL_CURSOR_FOREGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalCursor.foreground', null, nls.localize('terminalCursor.foreground', 'The foreground color of the terminal cursor.'));
    exports.TERMINAL_CURSOR_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalCursor.background', null, nls.localize('terminalCursor.background', 'The background color of the terminal cursor. Allows customizing the color of a character overlapped by a block cursor.'));
    exports.TERMINAL_SELECTION_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.selectionBackground', {
        light: colorRegistry_1.editorSelectionBackground,
        dark: colorRegistry_1.editorSelectionBackground,
        hcDark: colorRegistry_1.editorSelectionBackground,
        hcLight: colorRegistry_1.editorSelectionBackground
    }, nls.localize('terminal.selectionBackground', 'The selection background color of the terminal.'));
    exports.TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.inactiveSelectionBackground', {
        light: (0, colorRegistry_1.transparent)(exports.TERMINAL_SELECTION_BACKGROUND_COLOR, 0.5),
        dark: (0, colorRegistry_1.transparent)(exports.TERMINAL_SELECTION_BACKGROUND_COLOR, 0.5),
        hcDark: (0, colorRegistry_1.transparent)(exports.TERMINAL_SELECTION_BACKGROUND_COLOR, 0.7),
        hcLight: (0, colorRegistry_1.transparent)(exports.TERMINAL_SELECTION_BACKGROUND_COLOR, 0.5)
    }, nls.localize('terminal.inactiveSelectionBackground', 'The selection background color of the terminal when it does not have focus.'));
    exports.TERMINAL_SELECTION_FOREGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.selectionForeground', {
        light: null,
        dark: null,
        hcDark: '#000000',
        hcLight: '#ffffff'
    }, nls.localize('terminal.selectionForeground', 'The selection foreground color of the terminal. When this is null the selection foreground will be retained and have the minimum contrast ratio feature applied.'));
    exports.TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalCommandDecoration.defaultBackground', {
        light: '#00000040',
        dark: '#ffffff40',
        hcDark: '#ffffff80',
        hcLight: '#00000040',
    }, nls.localize('terminalCommandDecoration.defaultBackground', 'The default terminal command decoration background color.'));
    exports.TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalCommandDecoration.successBackground', {
        dark: '#1B81A8',
        light: '#2090D3',
        hcDark: '#1B81A8',
        hcLight: '#007100'
    }, nls.localize('terminalCommandDecoration.successBackground', 'The terminal command decoration background color for successful commands.'));
    exports.TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalCommandDecoration.errorBackground', {
        dark: '#F14C4C',
        light: '#E51400',
        hcDark: '#F14C4C',
        hcLight: '#B5200D'
    }, nls.localize('terminalCommandDecoration.errorBackground', 'The terminal command decoration background color for error commands.'));
    exports.TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalOverviewRuler.cursorForeground', {
        dark: '#A0A0A0CC',
        light: '#A0A0A0CC',
        hcDark: '#A0A0A0CC',
        hcLight: '#A0A0A0CC'
    }, nls.localize('terminalOverviewRuler.cursorForeground', 'The overview ruler cursor color.'));
    exports.TERMINAL_BORDER_COLOR = (0, colorRegistry_1.registerColor)('terminal.border', {
        dark: theme_1.PANEL_BORDER,
        light: theme_1.PANEL_BORDER,
        hcDark: theme_1.PANEL_BORDER,
        hcLight: theme_1.PANEL_BORDER
    }, nls.localize('terminal.border', 'The color of the border that separates split panes within the terminal. This defaults to panel.border.'));
    exports.TERMINAL_FIND_MATCH_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.findMatchBackground', {
        dark: colorRegistry_1.editorFindMatch,
        light: colorRegistry_1.editorFindMatch,
        // Use regular selection background in high contrast with a thick border
        hcDark: null,
        hcLight: '#0F4A85'
    }, nls.localize('terminal.findMatchBackground', 'Color of the current search match in the terminal. The color must not be opaque so as not to hide underlying terminal content.'), true);
    exports.TERMINAL_HOVER_HIGHLIGHT_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.hoverHighlightBackground', {
        dark: (0, colorRegistry_1.transparent)(colorRegistry_1.editorHoverHighlight, 0.5),
        light: (0, colorRegistry_1.transparent)(colorRegistry_1.editorHoverHighlight, 0.5),
        hcDark: (0, colorRegistry_1.transparent)(colorRegistry_1.editorHoverHighlight, 0.5),
        hcLight: (0, colorRegistry_1.transparent)(colorRegistry_1.editorHoverHighlight, 0.5)
    }, nls.localize('terminal.findMatchHighlightBorder', 'Border color of the other search matches in the terminal.'));
    exports.TERMINAL_FIND_MATCH_BORDER_COLOR = (0, colorRegistry_1.registerColor)('terminal.findMatchBorder', {
        dark: null,
        light: null,
        hcDark: '#f38518',
        hcLight: '#0F4A85'
    }, nls.localize('terminal.findMatchBorder', 'Border color of the current search match in the terminal.'));
    exports.TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminal.findMatchHighlightBackground', {
        dark: colorRegistry_1.editorFindMatchHighlight,
        light: colorRegistry_1.editorFindMatchHighlight,
        hcDark: null,
        hcLight: null
    }, nls.localize('terminal.findMatchHighlightBackground', 'Color of the other search matches in the terminal. The color must not be opaque so as not to hide underlying terminal content.'), true);
    exports.TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR = (0, colorRegistry_1.registerColor)('terminal.findMatchHighlightBorder', {
        dark: null,
        light: null,
        hcDark: '#f38518',
        hcLight: '#0F4A85'
    }, nls.localize('terminal.findMatchHighlightBorder', 'Border color of the other search matches in the terminal.'));
    exports.TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR = (0, colorRegistry_1.registerColor)('terminalOverviewRuler.findMatchForeground', {
        dark: colorRegistry_1.overviewRulerFindMatchForeground,
        light: colorRegistry_1.overviewRulerFindMatchForeground,
        hcDark: '#f38518',
        hcLight: '#0F4A85'
    }, nls.localize('terminalOverviewRuler.findMatchHighlightForeground', 'Overview ruler marker color for find matches in the terminal.'));
    exports.TERMINAL_DRAG_AND_DROP_BACKGROUND = (0, colorRegistry_1.registerColor)('terminal.dropBackground', {
        dark: theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND,
        light: theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND,
        hcDark: theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND,
        hcLight: theme_1.EDITOR_DRAG_AND_DROP_BACKGROUND
    }, nls.localize('terminal.dragAndDropBackground', "Background color when dragging on top of terminals. The color should have transparency so that the terminal contents can still shine through."), true);
    exports.TERMINAL_TAB_ACTIVE_BORDER = (0, colorRegistry_1.registerColor)('terminal.tab.activeBorder', {
        dark: theme_1.TAB_ACTIVE_BORDER,
        light: theme_1.TAB_ACTIVE_BORDER,
        hcDark: theme_1.TAB_ACTIVE_BORDER,
        hcLight: theme_1.TAB_ACTIVE_BORDER
    }, nls.localize('terminal.tab.activeBorder', 'Border on the side of the terminal tab in the panel. This defaults to tab.activeBorder.'));
    exports.ansiColorMap = {
        'terminal.ansiBlack': {
            index: 0,
            defaults: {
                light: '#000000',
                dark: '#000000',
                hcDark: '#000000',
                hcLight: '#292929'
            }
        },
        'terminal.ansiRed': {
            index: 1,
            defaults: {
                light: '#cd3131',
                dark: '#cd3131',
                hcDark: '#cd0000',
                hcLight: '#cd3131'
            }
        },
        'terminal.ansiGreen': {
            index: 2,
            defaults: {
                light: '#00BC00',
                dark: '#0DBC79',
                hcDark: '#00cd00',
                hcLight: '#00bc00'
            }
        },
        'terminal.ansiYellow': {
            index: 3,
            defaults: {
                light: '#949800',
                dark: '#e5e510',
                hcDark: '#cdcd00',
                hcLight: '#949800'
            }
        },
        'terminal.ansiBlue': {
            index: 4,
            defaults: {
                light: '#0451a5',
                dark: '#2472c8',
                hcDark: '#0000ee',
                hcLight: '#0451a5'
            }
        },
        'terminal.ansiMagenta': {
            index: 5,
            defaults: {
                light: '#bc05bc',
                dark: '#bc3fbc',
                hcDark: '#cd00cd',
                hcLight: '#bc05bc'
            }
        },
        'terminal.ansiCyan': {
            index: 6,
            defaults: {
                light: '#0598bc',
                dark: '#11a8cd',
                hcDark: '#00cdcd',
                hcLight: '#0598bc'
            }
        },
        'terminal.ansiWhite': {
            index: 7,
            defaults: {
                light: '#555555',
                dark: '#e5e5e5',
                hcDark: '#e5e5e5',
                hcLight: '#555555'
            }
        },
        'terminal.ansiBrightBlack': {
            index: 8,
            defaults: {
                light: '#666666',
                dark: '#666666',
                hcDark: '#7f7f7f',
                hcLight: '#666666'
            }
        },
        'terminal.ansiBrightRed': {
            index: 9,
            defaults: {
                light: '#cd3131',
                dark: '#f14c4c',
                hcDark: '#ff0000',
                hcLight: '#cd3131'
            }
        },
        'terminal.ansiBrightGreen': {
            index: 10,
            defaults: {
                light: '#14CE14',
                dark: '#23d18b',
                hcDark: '#00ff00',
                hcLight: '#00bc00'
            }
        },
        'terminal.ansiBrightYellow': {
            index: 11,
            defaults: {
                light: '#b5ba00',
                dark: '#f5f543',
                hcDark: '#ffff00',
                hcLight: '#b5ba00'
            }
        },
        'terminal.ansiBrightBlue': {
            index: 12,
            defaults: {
                light: '#0451a5',
                dark: '#3b8eea',
                hcDark: '#5c5cff',
                hcLight: '#0451a5'
            }
        },
        'terminal.ansiBrightMagenta': {
            index: 13,
            defaults: {
                light: '#bc05bc',
                dark: '#d670d6',
                hcDark: '#ff00ff',
                hcLight: '#bc05bc'
            }
        },
        'terminal.ansiBrightCyan': {
            index: 14,
            defaults: {
                light: '#0598bc',
                dark: '#29b8db',
                hcDark: '#00ffff',
                hcLight: '#0598bc'
            }
        },
        'terminal.ansiBrightWhite': {
            index: 15,
            defaults: {
                light: '#a5a5a5',
                dark: '#e5e5e5',
                hcDark: '#ffffff',
                hcLight: '#a5a5a5'
            }
        }
    };
    function registerColors() {
        for (const id in exports.ansiColorMap) {
            const entry = exports.ansiColorMap[id];
            const colorName = id.substring(13);
            exports.ansiColorIdentifiers[entry.index] = (0, colorRegistry_1.registerColor)(id, entry.defaults, nls.localize('terminal.ansiColor', '\'{0}\' ANSI color in the terminal.', colorName));
        }
    }
    exports.registerColors = registerColors;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDb2xvclJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9jb21tb24vdGVybWluYWxDb2xvclJlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRzs7O09BR0c7SUFDVSxRQUFBLG9CQUFvQixHQUFzQixFQUFFLENBQUM7SUFFN0MsUUFBQSx5QkFBeUIsR0FBRyxJQUFBLDZCQUFhLEVBQUMscUJBQXFCLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsbUdBQW1HLENBQUMsQ0FBQyxDQUFDO0lBQ2pOLFFBQUEseUJBQXlCLEdBQUcsSUFBQSw2QkFBYSxFQUFDLHFCQUFxQixFQUFFO1FBQzdFLEtBQUssRUFBRSxTQUFTO1FBQ2hCLElBQUksRUFBRSxTQUFTO1FBQ2YsTUFBTSxFQUFFLFNBQVM7UUFDakIsT0FBTyxFQUFFLFNBQVM7S0FDbEIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLHVDQUF1QyxDQUFDLENBQUMsQ0FBQztJQUNwRSxRQUFBLGdDQUFnQyxHQUFHLElBQUEsNkJBQWEsRUFBQywyQkFBMkIsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7SUFDL0ssUUFBQSxnQ0FBZ0MsR0FBRyxJQUFBLDZCQUFhLEVBQUMsMkJBQTJCLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsd0hBQXdILENBQUMsQ0FBQyxDQUFDO0lBQ3pQLFFBQUEsbUNBQW1DLEdBQUcsSUFBQSw2QkFBYSxFQUFDLDhCQUE4QixFQUFFO1FBQ2hHLEtBQUssRUFBRSx5Q0FBeUI7UUFDaEMsSUFBSSxFQUFF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
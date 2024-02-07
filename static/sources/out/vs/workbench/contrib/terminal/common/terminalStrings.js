/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.terminalStrings = void 0;
    /**
     * An object holding strings shared by multiple parts of the terminal
     */
    exports.terminalStrings = {
        terminal: (0, nls_1.localize)('terminal', "Terminal"),
        new: (0, nls_1.localize)('terminal.new', "New Terminal"),
        doNotShowAgain: (0, nls_1.localize)('doNotShowAgain', 'Do Not Show Again'),
        currentSessionCategory: (0, nls_1.localize)('currentSessionCategory', 'current session'),
        previousSessionCategory: (0, nls_1.localize)('previousSessionCategory', 'previous session'),
        typeTask: (0, nls_1.localize)('task', "Task"),
        typeLocal: (0, nls_1.localize)('local', "Local"),
        actionCategory: {
            value: (0, nls_1.localize)('terminalCategory', "Terminal"),
            original: 'Terminal'
        },
        focus: {
            value: (0, nls_1.localize)('workbench.action.terminal.focus', "Focus Terminal"),
            original: 'Focus Terminal'
        },
        focusAndHideAccessibleBuffer: {
            value: (0, nls_1.localize)('workbench.action.terminal.focusAndHideAccessibleBuffer', "Focus Terminal and Hide Accessible Buffer"),
            original: 'Focus Terminal and Hide Accessible Buffer'
        },
        kill: {
            value: (0, nls_1.localize)('killTerminal', "Kill Terminal"),
            original: 'Kill Terminal',
            short: (0, nls_1.localize)('killTerminal.short', "Kill"),
        },
        moveToEditor: {
            value: (0, nls_1.localize)('moveToEditor', "Move Terminal into Editor Area"),
            original: 'Move Terminal into Editor Area',
        },
        moveIntoNewWindow: {
            value: (0, nls_1.localize)('moveIntoNewWindow', "Move Terminal into New Window"),
            original: 'Move Terminal into New Window',
        },
        moveToTerminalPanel: {
            value: (0, nls_1.localize)('workbench.action.terminal.moveToTerminalPanel', "Move Terminal into Panel"),
            original: 'Move Terminal into Panel'
        },
        changeIcon: {
            value: (0, nls_1.localize)('workbench.action.terminal.changeIcon', "Change Icon..."),
            original: 'Change Icon...'
        },
        changeColor: {
            value: (0, nls_1.localize)('workbench.action.terminal.changeColor', "Change Color..."),
            original: 'Change Color...'
        },
        split: {
            value: (0, nls_1.localize)('splitTerminal', "Split Terminal"),
            original: 'Split Terminal',
            short: (0, nls_1.localize)('splitTerminal.short', "Split"),
        },
        unsplit: {
            value: (0, nls_1.localize)('unsplitTerminal', "Unsplit Terminal"),
            original: 'Unsplit Terminal'
        },
        rename: {
            value: (0, nls_1.localize)('workbench.action.terminal.rename', "Rename..."),
            original: 'Rename...'
        },
        toggleSizeToContentWidth: {
            value: (0, nls_1.localize)('workbench.action.terminal.sizeToContentWidthInstance', "Toggle Size to Content Width"),
            original: 'Toggle Size to Content Width'
        },
        focusHover: {
            value: (0, nls_1.localize)('workbench.action.terminal.focusHover', "Focus Hover"),
            original: 'Focus Hover'
        },
        sendSequence: {
            value: (0, nls_1.localize)('workbench.action.terminal.sendSequence', "Send Custom Sequence To Terminal"),
            original: 'Send Custom Sequence To Terminal'
        },
        newWithCwd: {
            value: (0, nls_1.localize)('workbench.action.terminal.newWithCwd', "Create New Terminal Starting in a Custom Working Directory"),
            original: 'Create New Terminal Starting in a Custom Working Directory'
        },
        renameWithArgs: {
            value: (0, nls_1.localize)('workbench.action.terminal.renameWithArg', "Rename the Currently Active Terminal"),
            original: 'Rename the Currently Active Terminal'
        },
        stickyScroll: {
            value: (0, nls_1.localize)('stickyScroll', "Sticky Scroll"),
            original: 'Sticky Scroll'
        },
        scrollToPreviousCommand: {
            value: (0, nls_1.localize)('workbench.action.terminal.scrollToPreviousCommand', "Scroll To Previous Command"),
            original: 'Scroll To Previous Command'
        },
        scrollToNextCommand: {
            value: (0, nls_1.localize)('workbench.action.terminal.scrollToNextCommand', "Scroll To Next Command"),
            original: 'Scroll To Next Command'
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxTdHJpbmdzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9jb21tb24vdGVybWluYWxTdHJpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRzs7T0FFRztJQUNVLFFBQUEsZUFBZSxHQUFHO1FBQzlCLFFBQVEsRUFBRSxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsVUFBVSxDQUFDO1FBQzFDLEdBQUcsRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsY0FBYyxDQUFDO1FBQzdDLGNBQWMsRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxtQkFBbUIsQ0FBQztRQUMvRCxzQkFBc0IsRUFBRSxJQUFBLGNBQVEsRUFBQyx3QkFBd0IsRUFBRSxpQkFBaUIsQ0FBQztRQUM3RSx1QkFBdUIsRUFBRSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSxrQkFBa0IsQ0FBQztRQUNoRixRQUFRLEVBQUUsSUFBQSxjQUFRLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNsQyxTQUFTLEVBQUUsSUFBQSxjQUFRLEVBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztRQUNyQyxjQUFjLEVBQUU7WUFDZixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDO1lBQy9DLFFBQVEsRUFBRSxVQUFVO1NBQ3BCO1FBQ0QsS0FBSyxFQUFFO1lBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLGlDQUFpQyxFQUFFLGdCQUFnQixDQUFDO1lBQ3BFLFFBQVEsRUFBRSxnQkFBZ0I7U0FDMUI7UUFDRCw0QkFBNEIsRUFBRTtZQUM3QixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0RBQXdELEVBQUUsMkNBQTJDLENBQUM7WUFDdEgsUUFBUSxFQUFFLDJDQUEy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
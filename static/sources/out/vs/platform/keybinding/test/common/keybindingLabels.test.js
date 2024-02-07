/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/platform/keybinding/test/common/keybindingsTestUtils"], function (require, exports, assert, keyCodes_1, keybindingsTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('KeybindingLabels', () => {
        function assertUSLabel(OS, keybinding, expected) {
            const usResolvedKeybinding = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, OS);
            assert.strictEqual(usResolvedKeybinding.getLabel(), expected);
        }
        test('Windows US label', () => {
            // no modifier
            assertUSLabel(1 /* OperatingSystem.Windows */, 31 /* KeyCode.KeyA */, 'A');
            // one modifier
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 'Ctrl+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'Shift+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Alt+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Windows+A');
            // two modifiers
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Ctrl+Alt+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Windows+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Shift+Alt+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Shift+Windows+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Alt+Windows+A');
            // three modifiers
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Windows+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Alt+Windows+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Shift+Alt+Windows+A');
            // four modifiers
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+Windows+A');
            // chord
            assertUSLabel(1 /* OperatingSystem.Windows */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), 'Ctrl+A Ctrl+B');
        });
        test('Linux US label', () => {
            // no modifier
            assertUSLabel(3 /* OperatingSystem.Linux */, 31 /* KeyCode.KeyA */, 'A');
            // one modifier
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 'Ctrl+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'Shift+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Alt+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Super+A');
            // two modifiers
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Ctrl+Alt+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Super+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Shift+Alt+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Shift+Super+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Alt+Super+A');
            // three modifiers
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Super+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Alt+Super+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Shift+Alt+Super+A');
            // four modifiers
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+Super+A');
            // chord
            assertUSLabel(3 /* OperatingSystem.Linux */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), 'Ctrl+A Ctrl+B');
        });
        test('Mac US label', () => {
            // no modifier
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 31 /* KeyCode.KeyA */, 'A');
            // one modifier
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, '⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, '⇧A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, '⌥A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃A');
            // two modifiers
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, '⇧⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, '⌥⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, '⇧⌥A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⇧A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⌥A');
            // three modifiers
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, '⇧⌥⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⇧⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⌥⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⇧⌥A');
            // four modifiers
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⇧⌥⌘A');
            // chord
            assertUSLabel(2 /* OperatingSystem.Macintosh */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), '⌘A ⌘B');
            // special keys
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 15 /* KeyCode.LeftArrow */, '←');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 16 /* KeyCode.UpArrow */, '↑');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 17 /* KeyCode.RightArrow */, '→');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 18 /* KeyCode.DownArrow */, '↓');
        });
        test('Aria label', () => {
            function assertAriaLabel(OS, keybinding, expected) {
                const usResolvedKeybinding = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, OS);
                assert.strictEqual(usResolvedKeybinding.getAriaLabel(), expected);
            }
            assertAriaLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Control+Shift+Alt+Windows+A');
            assertAriaLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Control+Shift+Alt+Super+A');
            assertAriaLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Control+Shift+Option+Command+A');
        });
        test('Electron Accelerator label', () => {
            function assertElectronAcceleratorLabel(OS, keybinding, expected) {
                const usResolvedKeybinding = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, OS);
                assert.strictEqual(usResolvedKeybinding.getElectronAccelerator(), expected);
            }
            assertElectronAcceleratorLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+Super+A');
            assertElectronAcceleratorLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+Super+A');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+Cmd+A');
            // electron cannot handle chords
            assertElectronAcceleratorLabel(1 /* OperatingSystem.Windows */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), null);
            assertElectronAcceleratorLabel(3 /* OperatingSystem.Linux */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), null);
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), null);
            // electron cannot handle numpad keys
            assertElectronAcceleratorLabel(1 /* OperatingSystem.Windows */, 99 /* KeyCode.Numpad1 */, null);
            assertElectronAcceleratorLabel(3 /* OperatingSystem.Linux */, 99 /* KeyCode.Numpad1 */, null);
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 99 /* KeyCode.Numpad1 */, null);
            // special
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 15 /* KeyCode.LeftArrow */, 'Left');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 16 /* KeyCode.UpArrow */, 'Up');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 17 /* KeyCode.RightArrow */, 'Right');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 18 /* KeyCode.DownArrow */, 'Down');
        });
        test('User Settings label', () => {
            function assertElectronAcceleratorLabel(OS, keybinding, expected) {
                const usResolvedKeybinding = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, OS);
                assert.strictEqual(usResolvedKeybinding.getUserSettingsLabel(), expected);
            }
            assertElectronAcceleratorLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+win+a');
            assertElectronAcceleratorLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+meta+a');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+cmd+a');
            // electron cannot handle chords
            assertElectronAcceleratorLabel(1 /* OperatingSystem.Windows */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), 'ctrl+a ctrl+b');
            assertElectronAcceleratorLabel(3 /* OperatingSystem.Linux */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), 'ctrl+a ctrl+b');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), 'cmd+a cmd+b');
        });
        test('issue #91235: Do not end with a +', () => {
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 6 /* KeyCode.Alt */, 'Ctrl+Alt');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ0xhYmVscy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9rZXliaW5kaW5nL3Rlc3QvY29tbW9uL2tleWJpbmRpbmdMYWJlbHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU9oRyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1FBRTlCLFNBQVMsYUFBYSxDQUFDLEVBQW1CLEVBQUUsVUFBa0IsRUFBRSxRQUFnQjtZQUMvRSxNQUFNLG9CQUFvQixHQUFHLElBQUEsdURBQWdDLEVBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBRSxDQUFDO1lBQy9FLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELElBQUksQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7WUFDN0IsY0FBYztZQUNkLGFBQWEseURBQXdDLEdBQUcsQ0FBQyxDQUFDO1lBRTFELGVBQWU7WUFDZixhQUFhLGtDQUEwQixpREFBNkIsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNoRixhQUFhLGtDQUEwQiwrQ0FBMkIsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMvRSxhQUFhLGtDQUEwQiw0Q0FBeUIsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMzRSxhQUFhLGtDQUEwQixnREFBNkIsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUVuRixnQkFBZ0I7WUFDaEIsYUFBYSxrQ0FBMEIsbURBQTZCLHdCQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDckcsYUFBYSxrQ0FBMEIsZ0RBQTJCLHdCQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDakcsYUFBYSxrQ0FBMEIsb0RBQStCLHdCQUFlLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUN6RyxhQUFhLGtD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
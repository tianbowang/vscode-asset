define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/base/common/keybindingParser", "vs/workbench/services/keybinding/common/keybindingIO", "vs/platform/keybinding/test/common/keybindingsTestUtils"], function (require, exports, assert, keyCodes_1, keybindings_1, keybindingParser_1, keybindingIO_1, keybindingsTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('keybindingIO', () => {
        test('serialize/deserialize', () => {
            function testOneSerialization(keybinding, expected, msg, OS) {
                const usLayoutResolvedKeybinding = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, OS);
                const actualSerialized = usLayoutResolvedKeybinding.getUserSettingsLabel();
                assert.strictEqual(actualSerialized, expected, expected + ' - ' + msg);
            }
            function testSerialization(keybinding, expectedWin, expectedMac, expectedLinux) {
                testOneSerialization(keybinding, expectedWin, 'win', 1 /* OperatingSystem.Windows */);
                testOneSerialization(keybinding, expectedMac, 'mac', 2 /* OperatingSystem.Macintosh */);
                testOneSerialization(keybinding, expectedLinux, 'linux', 3 /* OperatingSystem.Linux */);
            }
            function testOneDeserialization(keybinding, _expected, msg, OS) {
                const actualDeserialized = keybindingParser_1.KeybindingParser.parseKeybinding(keybinding);
                const expected = (0, keybindings_1.decodeKeybinding)(_expected, OS);
                assert.deepStrictEqual(actualDeserialized, expected, keybinding + ' - ' + msg);
            }
            function testDeserialization(inWin, inMac, inLinux, expected) {
                testOneDeserialization(inWin, expected, 'win', 1 /* OperatingSystem.Windows */);
                testOneDeserialization(inMac, expected, 'mac', 2 /* OperatingSystem.Macintosh */);
                testOneDeserialization(inLinux, expected, 'linux', 3 /* OperatingSystem.Linux */);
            }
            function testRoundtrip(keybinding, expectedWin, expectedMac, expectedLinux) {
                testSerialization(keybinding, expectedWin, expectedMac, expectedLinux);
                testDeserialization(expectedWin, expectedMac, expectedLinux, keybinding);
            }
            testRoundtrip(21 /* KeyCode.Digit0 */, '0', '0', '0');
            testRoundtrip(31 /* KeyCode.KeyA */, 'a', 'a', 'a');
            testRoundtrip(16 /* KeyCode.UpArrow */, 'up', 'up', 'up');
            testRoundtrip(17 /* KeyCode.RightArrow */, 'right', 'right', 'right');
            testRoundtrip(18 /* KeyCode.DownArrow */, 'down', 'down', 'down');
            testRoundtrip(15 /* KeyCode.LeftArrow */, 'left', 'left', 'left');
            // one modifier
            testRoundtrip(512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'alt+a', 'alt+a', 'alt+a');
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 'ctrl+a', 'cmd+a', 'ctrl+a');
            testRoundtrip(1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'shift+a', 'shift+a', 'shift+a');
            testRoundtrip(256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'win+a', 'ctrl+a', 'meta+a');
            // two modifiers
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'ctrl+alt+a', 'alt+cmd+a', 'ctrl+alt+a');
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+a', 'shift+cmd+a', 'ctrl+shift+a');
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+win+a', 'ctrl+cmd+a', 'ctrl+meta+a');
            testRoundtrip(1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'shift+alt+a', 'shift+alt+a', 'shift+alt+a');
            testRoundtrip(1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'shift+win+a', 'ctrl+shift+a', 'shift+meta+a');
            testRoundtrip(512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'alt+win+a', 'ctrl+alt+a', 'alt+meta+a');
            // three modifiers
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+a', 'shift+alt+cmd+a', 'ctrl+shift+alt+a');
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+win+a', 'ctrl+shift+cmd+a', 'ctrl+shift+meta+a');
            testRoundtrip(1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'shift+alt+win+a', 'ctrl+shift+alt+a', 'shift+alt+meta+a');
            // all modifiers
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+win+a', 'ctrl+shift+alt+cmd+a', 'ctrl+shift+alt+meta+a');
            // chords
            testRoundtrip((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */), 'ctrl+a ctrl+a', 'cmd+a cmd+a', 'ctrl+a ctrl+a');
            testRoundtrip((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */, 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */), 'ctrl+up ctrl+up', 'cmd+up cmd+up', 'ctrl+up ctrl+up');
            // OEM keys
            testRoundtrip(85 /* KeyCode.Semicolon */, ';', ';', ';');
            testRoundtrip(86 /* KeyCode.Equal */, '=', '=', '=');
            testRoundtrip(87 /* KeyCode.Comma */, ',', ',', ',');
            testRoundtrip(88 /* KeyCode.Minus */, '-', '-', '-');
            testRoundtrip(89 /* KeyCode.Period */, '.', '.', '.');
            testRoundtrip(90 /* KeyCode.Slash */, '/', '/', '/');
            testRoundtrip(91 /* KeyCode.Backquote */, '`', '`', '`');
            testRoundtrip(115 /* KeyCode.ABNT_C1 */, 'abnt_c1', 'abnt_c1', 'abnt_c1');
            testRoundtrip(116 /* KeyCode.ABNT_C2 */, 'abnt_c2', 'abnt_c2', 'abnt_c2');
            testRoundtrip(92 /* KeyCode.BracketLeft */, '[', '[', '[');
            testRoundtrip(93 /* KeyCode.Backslash */, '\\', '\\', '\\');
            testRoundtrip(94 /* KeyCode.BracketRight */, ']', ']', ']');
            testRoundtrip(95 /* KeyCode.Quote */, '\'', '\'', '\'');
            testRoundtrip(96 /* KeyCode.OEM_8 */, 'oem_8', 'oem_8', 'oem_8');
            testRoundtrip(97 /* KeyCode.IntlBackslash */, 'oem_102', 'oem_102', 'oem_102');
            // OEM aliases
            testDeserialization('OEM_1', 'OEM_1', 'OEM_1', 85 /* KeyCode.Semicolon */);
            testDeserialization('OEM_PLUS', 'OEM_PLUS', 'OEM_PLUS', 86 /* KeyCode.Equal */);
            testDeserialization('OEM_COMMA', 'OEM_COMMA', 'OEM_COMMA', 87 /* KeyCode.Comma */);
            testDeserialization('OEM_MINUS', 'OEM_MINUS', 'OEM_MINUS', 88 /* KeyCode.Minus */);
            testDeserialization('OEM_PERIOD', 'OEM_PERIOD', 'OEM_PERIOD', 89 /* KeyCode.Period */);
            testDeserialization('OEM_2', 'OEM_2', 'OEM_2', 90 /* KeyCode.Slash */);
            testDeserialization('OEM_3', 'OEM_3', 'OEM_3', 91 /* KeyCode.Backquote */);
            testDeserialization('ABNT_C1', 'ABNT_C1', 'ABNT_C1', 115 /* KeyCode.ABNT_C1 */);
            testDeserialization('ABNT_C2', 'ABNT_C2', 'ABNT_C2', 116 /* KeyCode.ABNT_C2 */);
            testDeserialization('OEM_4', 'OEM_4', 'OEM_4', 92 /* KeyCode.BracketLeft */);
            testDeserialization('OEM_5', 'OEM_5', 'OEM_5', 93 /* KeyCode.Backslash */);
            testDeserialization('OEM_6', 'OEM_6', 'OEM_6', 94 /* KeyCode.BracketRight */);
            testDeserialization('OEM_7', 'OEM_7', 'OEM_7', 95 /* KeyCode.Quote */);
            testDeserialization('OEM_8', 'OEM_8', 'OEM_8', 96 /* KeyCode.OEM_8 */);
            testDeserialization('OEM_102', 'OEM_102', 'OEM_102', 97 /* KeyCode.IntlBackslash */);
            // accepts '-' as separator
            testDeserialization('ctrl-shift-alt-win-a', 'ctrl-shift-alt-cmd-a', 'ctrl-shift-alt-meta-a', 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */);
            // various input mistakes
            testDeserialization(' ctrl-shift-alt-win-A ', ' shift-alt-cmd-Ctrl-A ', ' ctrl-shift-alt-META-A ', 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */);
        });
        test('deserialize scan codes', () => {
            assert.deepStrictEqual(keybindingParser_1.KeybindingParser.parseKeybinding('ctrl+shift+[comma] ctrl+/'), new keybindings_1.Keybinding([new keybindings_1.ScanCodeChord(true, true, false, false, 60 /* ScanCode.Comma */), new keybindings_1.KeyCodeChord(true, false, false, false, 90 /* KeyCode.Slash */)]));
        });
        test('issue #10452 - invalid command', () => {
            const strJSON = `[{ "key": "ctrl+k ctrl+f", "command": ["firstcommand", "seccondcommand"] }]`;
            const userKeybinding = JSON.parse(strJSON)[0];
            const keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding);
            assert.strictEqual(keybindingItem.command, null);
        });
        test('issue #10452 - invalid when', () => {
            const strJSON = `[{ "key": "ctrl+k ctrl+f", "command": "firstcommand", "when": [] }]`;
            const userKeybinding = JSON.parse(strJSON)[0];
            const keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding);
            assert.strictEqual(keybindingItem.when, undefined);
        });
        test('issue #10452 - invalid key', () => {
            const strJSON = `[{ "key": [], "command": "firstcommand" }]`;
            const userKeybinding = JSON.parse(strJSON)[0];
            const keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding);
            assert.deepStrictEqual(keybindingItem.keybinding, null);
        });
        test('issue #10452 - invalid key 2', () => {
            const strJSON = `[{ "key": "", "command": "firstcommand" }]`;
            const userKeybinding = JSON.parse(strJSON)[0];
            const keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding);
            assert.deepStrictEqual(keybindingItem.keybinding, null);
        });
        test('test commands args', () => {
            const strJSON = `[{ "key": "ctrl+k ctrl+f", "command": "firstcommand", "when": [], "args": { "text": "theText" } }]`;
            const userKeybinding = JSON.parse(strJSON)[0];
            const keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding);
            assert.strictEqual(keybindingItem.commandArgs.text, 'theText');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ0lPLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9rZXliaW5kaW5nL3Rlc3QvYnJvd3Nlci9rZXliaW5kaW5nSU8udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxLQUFLLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtRQUUxQixJQUFJLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1lBRWxDLFNBQVMsb0JBQW9CLENBQUMsVUFBa0IsRUFBRSxRQUFnQixFQUFFLEdBQVcsRUFBRSxFQUFtQjtnQkFDbkcsTUFBTSwwQkFBMEIsR0FBRyxJQUFBLHVEQUFnQyxFQUFDLFVBQVUsRUFBRSxFQUFFLENBQUUsQ0FBQztnQkFDckYsTUFBTSxnQkFBZ0IsR0FBRywwQkFBMEIsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUMzRSxNQUFNLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxRQUFRLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ3hFLENBQUM7WUFDRCxTQUFTLGlCQUFpQixDQUFDLFVBQWtCLEVBQUUsV0FBbUIsRUFBRSxXQUFtQixFQUFFLGFBQXFCO2dCQUM3RyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLEtBQUssa0NBQTBCLENBQUM7Z0JBQzlFLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsS0FBSyxvQ0FBNEIsQ0FBQztnQkFDaEYsb0JBQW9CLENBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxPQUFPLGdDQUF3QixDQUFDO1lBQ2pGLENBQUM7WUFFRCxTQUFTLHNCQUFzQixDQUFDLFVBQWtCLEVBQUUsU0FBaUIsRUFBRSxHQUFXLEVBQUUsRUFBbUI7Z0JBQ3RHLE1BQU0sa0JBQWtCLEdBQUcsbUNBQWdCLENBQUMsZUFBZSxDQUFD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
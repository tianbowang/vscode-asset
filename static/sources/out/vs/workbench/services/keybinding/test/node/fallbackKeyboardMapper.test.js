/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/workbench/services/keybinding/common/fallbackKeyboardMapper", "vs/workbench/services/keybinding/test/node/keyboardMapperTestUtils"], function (require, exports, keyCodes_1, keybindings_1, fallbackKeyboardMapper_1, keyboardMapperTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('keyboardMapper - MAC fallback', () => {
        const mapper = new fallbackKeyboardMapper_1.FallbackKeyboardMapper(false, 2 /* OperatingSystem.Macintosh */);
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, (0, keybindings_1.decodeKeybinding)(k, 2 /* OperatingSystem.Macintosh */), expected);
        }
        test('resolveKeybinding Cmd+Z', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, [{
                    label: '⌘Z',
                    ariaLabel: 'Command+Z',
                    electronAccelerator: 'Cmd+Z',
                    userSettingsLabel: 'cmd+z',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+Z'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+K Cmd+=', () => {
            _assertResolveKeybinding((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */), [{
                    label: '⌘K ⌘=',
                    ariaLabel: 'Command+K Command+=',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+k cmd+=',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['meta+K', 'meta+='],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Cmd+Z', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: 56 /* KeyCode.KeyZ */,
                code: null
            }, {
                label: '⌘Z',
                ariaLabel: 'Command+Z',
                electronAccelerator: 'Cmd+Z',
                userSettingsLabel: 'cmd+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['meta+Z'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding Cmd+[Comma] Cmd+/', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, new keybindings_1.Keybinding([
                new keybindings_1.ScanCodeChord(false, false, false, true, 60 /* ScanCode.Comma */),
                new keybindings_1.KeyCodeChord(false, false, false, true, 90 /* KeyCode.Slash */),
            ]), [{
                    label: '⌘, ⌘/',
                    ariaLabel: 'Command+, Command+/',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+, cmd+/',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['meta+,', 'meta+/'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier Meta+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: 57 /* KeyCode.Meta */,
                code: null
            }, {
                label: '⌘',
                ariaLabel: 'Command',
                electronAccelerator: null,
                userSettingsLabel: 'cmd',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent Single Modifier Shift+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 4 /* KeyCode.Shift */,
                code: null
            }, {
                label: '⇧',
                ariaLabel: 'Shift',
                electronAccelerator: null,
                userSettingsLabel: 'shift',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['shift'],
            });
        });
        test('resolveKeyboardEvent Single Modifier Alt+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: true,
                metaKey: false,
                altGraphKey: false,
                keyCode: 6 /* KeyCode.Alt */,
                code: null
            }, {
                label: '⌥',
                ariaLabel: 'Option',
                electronAccelerator: null,
                userSettingsLabel: 'alt',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['alt'],
            });
        });
        test('resolveKeyboardEvent Only Modifiers Ctrl+Shift+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 4 /* KeyCode.Shift */,
                code: null
            }, {
                label: '⌃⇧',
                ariaLabel: 'Control+Shift',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+shift',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeyboardEvent mapAltGrToCtrlAlt AltGr+Z', () => {
            const mapper = new fallbackKeyboardMapper_1.FallbackKeyboardMapper(true, 2 /* OperatingSystem.Macintosh */);
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: true,
                keyCode: 56 /* KeyCode.KeyZ */,
                code: null
            }, {
                label: '⌃⌥Z',
                ariaLabel: 'Control+Option+Z',
                electronAccelerator: 'Ctrl+Alt+Z',
                userSettingsLabel: 'ctrl+alt+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+alt+Z'],
                singleModifierDispatchParts: [null],
            });
        });
    });
    suite('keyboardMapper - LINUX fallback', () => {
        const mapper = new fallbackKeyboardMapper_1.FallbackKeyboardMapper(false, 3 /* OperatingSystem.Linux */);
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, (0, keybindings_1.decodeKeybinding)(k, 3 /* OperatingSystem.Linux */), expected);
        }
        test('resolveKeybinding Ctrl+Z', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, [{
                    label: 'Ctrl+Z',
                    ariaLabel: 'Control+Z',
                    electronAccelerator: 'Ctrl+Z',
                    userSettingsLabel: 'ctrl+z',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+Z'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+=', () => {
            _assertResolveKeybinding((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */), [{
                    label: 'Ctrl+K Ctrl+=',
                    ariaLabel: 'Control+K Control+=',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+=',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+K', 'ctrl+='],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+Z', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 56 /* KeyCode.KeyZ */,
                code: null
            }, {
                label: 'Ctrl+Z',
                ariaLabel: 'Control+Z',
                electronAccelerator: 'Ctrl+Z',
                userSettingsLabel: 'ctrl+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+Z'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, new keybindings_1.Keybinding([
                new keybindings_1.ScanCodeChord(true, false, false, false, 60 /* ScanCode.Comma */),
                new keybindings_1.KeyCodeChord(true, false, false, false, 90 /* KeyCode.Slash */),
            ]), [{
                    label: 'Ctrl+, Ctrl+/',
                    ariaLabel: 'Control+, Control+/',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+, ctrl+/',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+,', 'ctrl+/'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveUserBinding Ctrl+[Comma]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, new keybindings_1.Keybinding([
                new keybindings_1.ScanCodeChord(true, false, false, false, 60 /* ScanCode.Comma */),
            ]), [{
                    label: 'Ctrl+,',
                    ariaLabel: 'Control+,',
                    electronAccelerator: 'Ctrl+,',
                    userSettingsLabel: 'ctrl+,',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+,'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier Ctrl+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: 5 /* KeyCode.Ctrl */,
                code: null
            }, {
                label: 'Ctrl',
                ariaLabel: 'Control',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['ctrl'],
            });
        });
        test('resolveKeyboardEvent mapAltGrToCtrlAlt AltGr+Z', () => {
            const mapper = new fallbackKeyboardMapper_1.FallbackKeyboardMapper(true, 3 /* OperatingSystem.Linux */);
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: true,
                keyCode: 56 /* KeyCode.KeyZ */,
                code: null
            }, {
                label: 'Ctrl+Alt+Z',
                ariaLabel: 'Control+Alt+Z',
                electronAccelerator: 'Ctrl+Alt+Z',
                userSettingsLabel: 'ctrl+alt+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+alt+Z'],
                singleModifierDispatchParts: [null],
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFsbGJhY2tLZXlib2FyZE1hcHBlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMva2V5YmluZGluZy90ZXN0L25vZGUvZmFsbGJhY2tLZXlib2FyZE1hcHBlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBUWhHLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxHQUFHLEVBQUU7UUFFM0MsTUFBTSxNQUFNLEdBQUcsSUFBSSwrQ0FBc0IsQ0FBQyxLQUFLLG9DQUE0QixDQUFDO1FBRTVFLFNBQVMsd0JBQXdCLENBQUMsQ0FBUyxFQUFFLFFBQStCO1lBQzNFLElBQUEsaURBQXVCLEVBQUMsTUFBTSxFQUFFLElBQUEsOEJBQWdCLEVBQUMsQ0FBQyxvQ0FBNkIsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1RixDQUFDO1FBRUQsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtZQUNwQyx3QkFBd0IsQ0FDdkIsaURBQTZCLEVBQzdCLENBQUM7b0JBQ0EsS0FBSyxFQUFFLElBQUk7b0JBQ1gsU0FBUyxFQUFFLFdBQVc7b0JBQ3RCLG1CQUFtQixFQUFFLE9BQU87b0JBQzVCLGlCQUFpQixFQUFFLE9BQU87b0JBQzFCLFNBQVMsRUFBRSxJQUFJO29CQUNmLFlBQVksRUFBRSxLQUFLO29CQUNuQixhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUM7b0JBQ3pCLDJCQUEyQixFQUFFLENBQUMsSUFBSSxDQUFDO2lCQUNuQyxDQUFDLENBQ0YsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLCtCQUErQixFQUFFLEdBQUcsRUFBRTtZQUMxQyx3QkFBd0IsQ0FDdkIsSUFBQSxtQkFBUSxFQUFDLGlEQUE2QixFQUFFLGtEQUE4QixDQUFDLEVBQ3ZFLENBQUM7b0JBQ0EsS0FBSyxFQUFF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